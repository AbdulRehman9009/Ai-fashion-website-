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

        // Get all orders for the user
        const orders = await Order.find({ customer: session.user.id }).lean();
        const orderIds = orders.map((o) => o._id);

        // Get payments for these orders
        const payments = await Payment.find({ order: { $in: orderIds } })
            .populate("order", "_id grandTotal")
            .sort({ createdAt: -1 })
            .lean();

        // Calculate summary
        const totalPaid = payments
            .filter((p) => p.status === "PAID" || p.status === "completed")
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
