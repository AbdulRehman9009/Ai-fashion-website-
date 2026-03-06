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

  // Allow TAILOR, SHOPKEEPER, and ADMIN to assign delivery
  if (!["TAILOR", "SHOPKEEPER", "ADMIN"].includes(token.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { orderId, deliveryPersonId, pickupAddress, deliveryAddress } = body;

  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Validate order status - should be TailoringCompleted or PaymentConfirmed (for non-tailoring orders)
  if (!["TailoringCompleted", "PaymentConfirmed"].includes(order.status)) {
    return NextResponse.json({
      error: "Order must be in TailoringCompleted or PaymentConfirmed status to assign delivery"
    }, { status: 400 });
  }

  // Validate permissions based on role
  if (token.role === "SHOPKEEPER") {
    const shop = await Shop.findOne({ owner: token.sub, _id: order.shop });
    if (!shop) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (token.role === "TAILOR") {
    // Verify tailor is assigned to this order
    if (String(order.assignedTailor) !== String(token.sub)) {
      return NextResponse.json({ error: "You are not assigned to this order" }, { status: 403 });
    }
  }

  // Validate shipping address exists
  if (!deliveryAddress || !deliveryAddress.city || !deliveryAddress.street) {
    return NextResponse.json({
      error: "Complete delivery address is required"
    }, { status: 400 });
  }
  const delivery = await Delivery.create({
    order: order._id,
    assignedTo: deliveryPersonId,
    pickupAddress,
    dropoffAddress: deliveryAddress,
    status: "Assigned",
    events: [{ status: "Assigned" }],
  });
  order.delivery = delivery._id;
  order.status = "DeliveryPending";
  order.timeline.push({ byRole: token.role, event: "DeliveryPending" });
  await order.save();
  return NextResponse.json({ id: String(delivery._id) }, { status: 201 });
}

