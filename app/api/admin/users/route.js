import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

// GET /api/admin/users - List all users with filters
export async function GET(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        // Build query
        const query = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: new RegExp(search, "i") },
                { email: new RegExp(search, "i") }
            ];
        }

        const users = await User.find(query)
            .select("email name role status image lastLogin createdAt")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

// POST /api/admin/users - Create new user
export async function POST(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { email, name, role, password } = body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const bcrypt = await import("bcryptjs");
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            name,
            role,
            passwordHash,
            status: "ACTIVE"
        });

        // Log action
        await AuditLog.create({
            admin: token.sub,
            action: "USER_CREATED",
            targetType: "USER",
            targetId: user._id,
            targetEmail: user.email,
            details: { role: user.role }
        });

        return NextResponse.json({
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
