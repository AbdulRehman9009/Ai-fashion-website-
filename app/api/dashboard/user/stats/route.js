import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token || token.role !== "USER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const userId = token.sub; // or token.id

        // Run all stats counts in parallel
        const ACTIVE_STATUSES = [
            "OrderCreated", "PaymentConfirmed", "TailoringPending",
            "TailoringInProgress", "TailoringCompleted", "DeliveryPending",
            "OutForPickup", "PickedUp", "OutForDelivery"
        ];

        const [activeOrders, completedOrders, pendingPayments] = await Promise.all([
            Order.countDocuments({
                user: userId,
                status: { $in: ACTIVE_STATUSES }
            }),
            Order.countDocuments({
                user: userId,
                status: "Delivered"
            }),
            Order.countDocuments({
                user: userId,
                paymentStatus: "PENDING"
            })
        ]);

        return NextResponse.json({
            activeOrders,
            completedOrders,
            pendingPayments
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
