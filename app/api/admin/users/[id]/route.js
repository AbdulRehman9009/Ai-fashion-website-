import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

// GET /api/admin/users/[id] - Get user details
export async function GET(req, { params }) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = await params;
        const user = await User.findById(id)
            .select("-passwordHash -resetPasswordToken -resetPasswordExpire")
            .lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

// PATCH /api/admin/users/[id] - Update user (status, role)
export async function PATCH(req, { params }) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { status, role, resetPassword } = body;

        const { id } = await params;
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updates = {};
        const auditDetails = {};

        // Update status
        if (status && status !== user.status) {
            updates.status = status;
            auditDetails.oldStatus = user.status;
            auditDetails.newStatus = status;

            await AuditLog.create({
                admin: token.sub,
                action: status === "ACTIVE" ? "USER_ACTIVATED" : "USER_DEACTIVATED",
                targetType: "USER",
                targetId: user._id,
                targetEmail: user.email,
                details: auditDetails
            });
        }

        // Update role
        if (role && role !== user.role) {
            updates.role = role;
            auditDetails.oldRole = user.role;
            auditDetails.newRole = role;

            await AuditLog.create({
                admin: token.sub,
                action: "USER_ROLE_CHANGED",
                targetType: "USER",
                targetId: user._id,
                targetEmail: user.email,
                details: auditDetails
            });
        }

        // Reset password (generate temporary password)
        if (resetPassword) {
            const bcrypt = await import("bcryptjs");
            const tempPassword = Math.random().toString(36).slice(-8);
            updates.passwordHash = await bcrypt.hash(tempPassword, 10);
            auditDetails.tempPassword = tempPassword;

            await AuditLog.create({
                admin: token.sub,
                action: "USER_PASSWORD_RESET",
                targetType: "USER",
                targetId: user._id,
                targetEmail: user.email,
                details: { by: "admin" }
            });
        }

        // Apply updates
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        ).select("-passwordHash -resetPasswordToken -resetPasswordExpire");

        return NextResponse.json({
            user: updatedUser,
            tempPassword: resetPassword ? auditDetails.tempPassword : undefined
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(req, { params }) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = await params;
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Prevent deleting yourself
        if (user._id.toString() === token.sub) {
            return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
        }

        await User.findByIdAndDelete(id);

        // Log action
        await AuditLog.create({
            admin: token.sub,
            action: "USER_DELETED",
            targetType: "USER",
            targetId: user._id,
            targetEmail: user.email,
            details: { role: user.role }
        });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
