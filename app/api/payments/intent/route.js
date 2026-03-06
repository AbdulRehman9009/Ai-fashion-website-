import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";

/**
 * POST /api/payments/intent
 * Manually confirm payment for an order (ADMIN/SHOPKEEPER only).
 * This is used for manual payment confirmation (e.g. bank transfer, in-person payment).
 * Regular users CANNOT use this endpoint — payments must go through Paddle or webhook.
 */
export async function POST(req) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Security: Only ADMIN and SHOPKEEPER can manually confirm payments
  if (token.role !== "ADMIN" && token.role !== "SHOPKEEPER") {
    return NextResponse.json(
      { error: "Only administrators and shopkeepers can confirm payments manually" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { orderId } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Shopkeepers can only confirm orders for their own shop
  if (token.role === "SHOPKEEPER") {
    const Shop = (await import("@/models/Shop")).default;
    const shop = await Shop.findOne({ _id: order.shop, owner: token.sub }).lean();
    if (!shop) {
      return NextResponse.json({ error: "You can only confirm payments for your own shop's orders" }, { status: 403 });
    }
  }

  // Prevent double-confirmation
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ error: "Payment already confirmed" }, { status: 400 });
  }

  const payment = await Payment.create({
    order: order._id,
    amount: order.pricing.grandTotal,
    method: "MANUAL",
    status: "PAID",
    transactionId: `manual_${Date.now()}`,
  });

  order.paymentStatus = "PAID";
  order.status = "PaymentConfirmed";
  order.timeline.push({
    byRole: token.role,
    event: "PaymentConfirmed",
    notes: `Manually confirmed by ${token.role}`
  });
  await order.save();

  return NextResponse.json({ paymentId: String(payment._id) });
}
