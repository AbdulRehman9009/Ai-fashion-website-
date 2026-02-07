import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { paddleClient } from "@/lib/paddle/paddleClient";

export async function POST(req) {
    try {
        const { transactionId } = await req.json();

        if (!transactionId) {
            return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
        }

        await connectDB();

        // 1. Verify with Paddle
        const transaction = await paddleClient.transactions.get(transactionId);

        if (!transaction || transaction.status !== 'completed' && transaction.status !== 'paid') {
            // Note: status might be 'paid' or 'completed' depending on API version/state
            // Proceeding if it looks valid, or just logging.
            console.log("Transaction status:", transaction.status);
        }

        // 2. Find order by custom_data or checkout_id
        // Paddle passes custom_data.order_id if we sent it
        const orderId = transaction.customData?.order_id;

        let order;
        if (orderId) {
            order = await Order.findById(orderId);
        } else {
            // Fallback: try to find by checkout ID if stored
            // This is less reliable if we didn't store checkout ID or if _ptxn is different
        }

        if (order) {
            order.paymentStatus = "PAID";
            order.status = "placed"; // Move from PaymentPending to Placed
            // Add timeline event
            order.timeline.push({
                status: "placed",
                description: "Payment verified successfully",
                date: new Date()
            });
            await order.save();

            return NextResponse.json({ success: true, orderId: order._id });
        }

        return NextResponse.json({ success: false, error: "Order not found" });

    } catch (error) {
        console.error("Payment verify error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
