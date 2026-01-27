import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { markEarningsAsAvailable } from "@/lib/paddle/paddlePayout";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { id: orderId } = await params;

        // Release payments (mark earnings as available)
        const result = await markEarningsAsAvailable(orderId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Payments released successfully",
        });
    } catch (error) {
        console.error("Error releasing payments:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
