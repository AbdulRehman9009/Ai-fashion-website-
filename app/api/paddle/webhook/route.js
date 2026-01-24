import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyPaddleSignature, parsePaddleEvent, extractOrderId } from "@/lib/paddle/paddleWebhook";
import { markEarningsAsAvailable, createEarningsForOrder } from "@/lib/paddle/paddlePayout";

export async function POST(req) {
    try {
        const body = await req.text();
        const headersList = headers();
        const signature = headersList.get("paddle-signature");

        // Verify webhook signature
        if (!verifyPaddleSignature(JSON.parse(body), signature, process.env.PADDLE_WEBHOOK_SECRET)) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        const event = parsePaddleEvent(JSON.parse(body));
        if (!event) {
            return NextResponse.json(
                { error: "Invalid event format" },
                { status: 400 }
            );
        }

        await connectDB();

        // Handle different event types
        switch (event.eventType) {
            case "transaction.completed":
                await handleTransactionCompleted(event);
                break;

            case "transaction.payment_failed":
                await handlePaymentFailed(event);
                break;

            case "transaction.refunded":
                await handleRefund(event);
                break;

            default:
                console.log(`Unhandled event type: ${event.eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Error processing Paddle webhook:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

/**
 * Handle successful payment
 */
async function handleTransactionCompleted(event) {
    const { data } = event;
    const orderId = extractOrderId(data.custom_data);

    if (!orderId) {
        console.error("No order ID found in transaction");
        return;
    }

    try {
        const order = await Order.findById(orderId).populate("shop assignedTailor assignedDelivery");
        if (!order) {
            console.error(`Order not found: ${orderId}`);
            return;
        }

        // IDEMPOTENCY CHECK: Skip if already paid
        if (order.paymentStatus === "PAID" && order.paddlePaymentId === data.id) {
            console.log(`Order ${orderId} already processed, skipping duplicate event`);
            return;
        }

        // Update order with Paddle payment details
        order.paddlePaymentId = data.id;
        order.paddleOrderId = data.order_id || data.id;
        order.paymentStatus = "PAID";
        order.status = "PaymentConfirmed";
        order.timeline.push({
            at: new Date(),
            byRole: "SYSTEM",
            event: "Payment received via Paddle",
            notes: `Transaction ID: ${data.id}`
        });
        await order.save();

        // Create earnings for all parties (legacy system)
        await createEarningsForOrder(order);

        // Mark earnings as available (since Paddle pays platform first)
        await markEarningsAsAvailable(orderId);

        // Generate payout records (new ledger system)
        try {
            const { generatePayoutsForOrder } = await import("@/lib/services/payoutService");
            await generatePayoutsForOrder(orderId);
        } catch (payoutError) {
            console.error("Error generating payouts:", payoutError);
            // Don't fail the webhook - payouts can be created manually
        }

        console.log(`Payment completed for order ${orderId}`);
    } catch (error) {
        console.error("Error handling transaction completed:", error);
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(event) {
    const { data } = event;
    const orderId = extractOrderId(data.custom_data);

    if (!orderId) {
        return;
    }

    try {
        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "FAILED",
            paddlePaymentId: data.id,
        });

        console.log(`Payment failed for order ${orderId}`);
    } catch (error) {
        console.error("Error handling payment failure:", error);
    }
}

/**
 * Handle refund
 */
async function handleRefund(event) {
    const { data } = event;
    const orderId = extractOrderId(data.custom_data);

    if (!orderId) {
        return;
    }

    try {
        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "REFUNDED",
            refundedAt: new Date(),
        });

        // Reverse earnings
        const Earning = (await import("@/models/Earning")).default;
        await Earning.updateMany(
            { order: orderId },
            { status: "failed", failureReason: "Order refunded" }
        );

        console.log(`Refund processed for order ${orderId}`);
    } catch (error) {
        console.error("Error handling refund:", error);
    }
}
