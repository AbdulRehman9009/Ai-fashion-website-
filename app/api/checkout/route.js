import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { paddleClient } from "@/lib/paddle/paddleClient";

/**
 * POST /api/checkout
 * Initialize a Paddle checkout transaction for an order
 */
export async function POST(req) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        await connectDB();

        // Find the order
        const order = await Order.findById(orderId).populate("shop");
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Verify the user owns this order
        if (order.user.toString() !== token.sub) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Check if already paid
        if (order.paymentStatus === "PAID") {
            return NextResponse.json({ error: "Order already paid" }, { status: 400 });
        }

        // Create Paddle transaction
        const transaction = await paddleClient.transactions.create({
            items: [
                {
                    price: {
                        product: {
                            name: `Order #${order._id.toString().slice(-6)}`,
                            description: `Order from ${order.shop?.name || "Style Genie"}`,
                            tax_category: "standard"
                        },
                        unit_price: {
                            amount: Math.round(order.pricing.grandTotal * 100).toString(),
                            currency_code: order.pricing.currency || "USD"
                        },
                        billing_cycle: null,
                        quantity: { minimum: 1, maximum: 1 }
                    },
                    quantity: 1
                }
            ],
            custom_data: {
                order_id: order._id.toString(),
                user_id: token.sub
            },
            checkout: {
                url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${order._id}`
            }
        });

        // Store checkout ID on order
        order.paddleCheckoutId = transaction.id;
        order.status = "PaymentPending";
        await order.save();

        return NextResponse.json({
            success: true,
            checkoutUrl: transaction.checkout?.url || null,
            transactionId: transaction.id
        });

    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout" },
            { status: 500 }
        );
    }
}
