import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Delivery from "@/models/Delivery";
import Order from "@/models/Order";

export async function PATCH(req, { params }) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (token.role !== "DELIVERY") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const status = body.status;
  const delivery = await Delivery.findById(params.id);
  if (!delivery) return NextResponse.json({ error: "Not found" }, { status: 404 });
  delivery.status = status;
  delivery.events.push({ status });
  await delivery.save();
  const order = await Order.findById(delivery.order);
  if (order) {
    order.status = status === "Delivered" ? "Delivered" : order.status;
    if (status === "Delivered") order.timeline.push({ byRole: "DELIVERY", event: "Delivered" });
    await order.save();
  }
  return NextResponse.json({ ok: true });
}

