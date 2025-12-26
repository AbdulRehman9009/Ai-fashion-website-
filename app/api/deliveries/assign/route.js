import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Delivery from "@/models/Delivery";
import Shop from "@/models/Shop";

export async function POST(req) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SHOPKEEPER", "ADMIN"].includes(token.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { orderId, assignedTo, pickupAddress, dropoffAddress } = body;
  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (token.role === "SHOPKEEPER") {
    const shop = await Shop.findOne({ owner: token.sub, _id: order.shop });
    if (!shop) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const delivery = await Delivery.create({
    order: order._id,
    assignedTo,
    pickupAddress,
    dropoffAddress,
    status: "Assigned",
    events: [{ status: "Assigned" }],
  });
  order.delivery = delivery._id;
  order.status = "DeliveryPending";
  order.timeline.push({ byRole: token.role, event: "DeliveryPending" });
  await order.save();
  return NextResponse.json({ id: String(delivery._id) }, { status: 201 });
}

