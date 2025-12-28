import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import AuditLog from "@/models/AuditLog";

// GET /api/admin/tailors - List all tailors with stats
export async function GET(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const tailors = await User.find({ role: "TAILOR" })
            .select("name email image status tailorProfile createdAt")
            .sort({ createdAt: -1 })
            .lean();

        // Get order stats for each tailor
        const tailorsWithStats = await Promise.all(
            tailors.map(async (tailor) => {
                const orderCount = await Order.countDocuments({ assignedTailor: tailor._id });
                return {
                    ...tailor,
                    orderCount
                };
            })
        );

        return NextResponse.json(tailorsWithStats);
    } catch (error) {
        console.error("Error fetching tailors:", error);
        return NextResponse.json({ error: "Failed to fetch tailors" }, { status: 500 });
    }
}

// PATCH /api/admin/tailors - Update tailor availability
export async function PATCH(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { tailorId, availability } = body;

        const tailor = await User.findById(tailorId);
        if (!tailor || tailor.role !== "TAILOR") {
            return NextResponse.json({ error: "Tailor not found" }, { status: 404 });
        }

        const updatedTailor = await User.findByIdAndUpdate(
            tailorId,
            { "tailorProfile.availability": availability },
            { new: true }
        ).select("name email tailorProfile");

        // Log action
        await AuditLog.create({
            admin: token.sub,
            action: availability ? "TAILOR_ENABLED" : "TAILOR_DISABLED",
            targetType: "TAILOR",
            targetId: tailor._id,
            targetEmail: tailor.email,
            details: { availability }
        });

        return NextResponse.json(updatedTailor);
    } catch (error) {
        console.error("Error updating tailor:", error);
        return NextResponse.json({ error: "Failed to update tailor" }, { status: 500 });
    }
}
