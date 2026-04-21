import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { paddleClient } from "@/lib/paddle/paddleClient";

/**
 * POST /api/payments/verify
 * Verify a Paddle payment and update order status.
 * Requires authentication — only the order owner or admin can verify.
 */
export async function POST(req) {
    try {
        // FIXED: Add authentication check — this was completely unauthenticated
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { transactionId } = await req.json();

        if (!transactionId) {
            return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
        }

        // FIXED: Guard against null paddleClient
        if (!paddleClient) {
            return NextResponse.json({ error: "Payment provider not configured" }, { status: 503 });
        }

        await connectDB();

        // 1. Verify with Paddle
        const transaction = await paddleClient.transactions.get(transactionId);

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // 2. Find order by custom_data
        const orderId = transaction.customData?.order_id || transaction.custom_data?.order_id;

        let order;
        if (orderId) {
            order = await Order.findById(orderId);
        }

        if (!order) {
            // Fallback: try to find by paddleCheckoutId
            order = await Order.findOne({ paddleCheckoutId: transactionId });
        }

        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        // Security: Only order owner or admin can verify
        if (token.role !== "ADMIN" && order.user.toString() !== token.sub) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check if already paid (idempotent)
        if (order.paymentStatus === "PAID") {
            return NextResponse.json({ success: true, orderId: order._id, message: "Already paid" });
        }

        // Check Paddle transaction status
        const isPaid = transaction.status === "completed" || transaction.status === "paid";

        if (isPaid) {
            order.paymentStatus = "PAID";
            // FIXED: Use valid Order status enum value, not "placed"
            order.status = "PaymentConfirmed";
            order.paddlePaymentId = transactionId;
            // FIXED: Use correct timeline schema { at, byRole, event, notes }
            order.timeline.push({
                at: new Date(),
                byRole: "SYSTEM",
                event: "PaymentConfirmed",
                notes: "Payment verified successfully via Paddle"
            });
            await order.save();

            // Create Payment record if not exists
            const existingPayment = await Payment.findOne({ order: order._id, status: "PAID" });
            if (!existingPayment) {
                await Payment.create({
                    order: order._id,
                    amount: order.pricing.grandTotal,
                    currency: order.pricing.currency || "USD",
                    method: "PADDLE",
                    status: "PAID",
                    paddleTransactionId: transactionId,
                    transactionId: `paddle_verify_${transactionId}`,
                });
            }

            return NextResponse.json({ success: true, orderId: order._id });
        }

        return NextResponse.json({
            success: false,
            error: "Payment not yet completed",
            status: transaction.status
        });

    } catch (error) {
        console.error("Payment verify error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
