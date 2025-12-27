import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token || token.role !== "USER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const userId = token.sub; // or token.id

        // Fetch counts
        const activeOrders = await Order.countDocuments({
            user: userId,
            status: { $in: ["PENDING", "ACCEPTED", "STITCHING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY"] }
        });

        const completedOrders = await Order.countDocuments({
            user: userId,
            status: "DELIVERED"
        });

        // Assume pending payment if status is PENDING or AWAITING_PAYMENT (if that exists)
        // For now, let's say "Pending" orders are pending payment if not paid. 
        // We'll simulate this logic.
        const pendingPayments = await Order.countDocuments({
            user: userId,
            paymentStatus: "PENDING"
        });

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
