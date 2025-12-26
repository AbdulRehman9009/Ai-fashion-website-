import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";

export async function POST(req) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { orderId } = body;
  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (token.role === "USER" && String(order.user) !== token.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const payment = await Payment.create({
    order: order._id,
    amount: order.pricing.grandTotal,
    method: "CARD",
    status: "PAID",
    transactionId: `tx_${Date.now()}`,
  });
  order.paymentStatus = "PAID";
  order.status = "PaymentConfirmed";
  order.timeline.push({ byRole: token.role, event: "PaymentConfirmed" });
  await order.save();
  return NextResponse.json({ paymentId: String(payment._id) });
}

