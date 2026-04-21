import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Order from "@/models/Order";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // FIXED: Order schema field is "user", not "customer"
        const orders = await Order.find({ user: session.user.id }).select("_id").lean();
        const orderIds = orders.map((o) => o._id);

        // Get payments for these orders
        // FIXED: populate order with "pricing" not "grandTotal" (grandTotal is nested under pricing)
        const payments = await Payment.find({ order: { $in: orderIds } })
            .populate("order", "_id pricing status")
            .sort({ createdAt: -1 })
            .lean();

        // Calculate summary
        const totalPaid = payments
            .filter((p) => p.status === "PAID")
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const totalPending = payments
            .filter((p) => p.status === "PENDING")
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const totalTransactions = payments.length;

        return NextResponse.json({
            payments,
            summary: {
                totalPaid,
                totalPending,
                totalTransactions,
            },
        });
    } catch (error) {
        console.error("Error fetching user payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch payments" },
            { status: 500 }
        );
    }
}
