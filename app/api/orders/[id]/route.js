import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req, { params }) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await Order.findById(id).populate("shop").populate("user").populate("items.product").lean();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (token.role === "ADMIN") return NextResponse.json(order);
  if (token.role === "USER" && String(order.user._id) !== token.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(order);
}

export async function PATCH(req, { params }) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (token.role !== "ADMIN" && token.role !== "USER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (token.role === "USER" && String(order.user) !== token.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (order.paymentStatus !== "PENDING") return NextResponse.json({ error: "Locked" }, { status: 400 });
  const body = await req.json();
  order.shippingAddress = body.shippingAddress || order.shippingAddress;
  await order.save();
  return NextResponse.json({ ok: true });
}

