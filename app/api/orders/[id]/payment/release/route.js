import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { releasePayments } from "@/lib/paymentDistribution";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const orderId = params.id;

        // Release payments
        const result = await releasePayments(orderId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Payments released successfully",
            results: result.results,
        });
    } catch (error) {
        console.error("Error releasing payments:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
