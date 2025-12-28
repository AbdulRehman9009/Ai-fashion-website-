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
  const { status, notes } = body;

  const delivery = await Delivery.findById(params.id);
  if (!delivery) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify delivery belongs to this delivery person
  if (String(delivery.assignedTo) !== String(token.sub)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate status enum
  const validStatuses = ["Assigned", "OutForPickup", "PickedUp", "OutForDelivery", "Delivered"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Update status if provided
  if (status) {
    delivery.status = status;
    delivery.events.push({ status, note: notes });

    // Set confirmation timestamp when delivered
    if (status === "Delivered") {
      delivery.confirmedAt = new Date();
    }
  }

  // Update notes if provided
  if (notes !== undefined) {
    delivery.deliveryNotes = notes;
  }

  await delivery.save();

  // Update related order
  const order = await Order.findById(delivery.order);
  if (order && status) {
    // Map delivery status to order status
    const statusMap = {
      "Assigned": "DeliveryPending",
      "OutForPickup": "OutForPickup",
      "PickedUp": "PickedUp",
      "OutForDelivery": "OutForDelivery",
      "Delivered": "Delivered"
    };

    order.status = statusMap[status] || order.status;

    if (status === "Delivered") {
      order.timeline.push({ byRole: "DELIVERY", event: "Delivered", notes });
      order.status = "Completed"; // Mark order as completed
    } else {
      order.timeline.push({ byRole: "DELIVERY", event: status, notes });
    }

    await order.save();
  }

  // Return enriched delivery data
  const updatedDelivery = await Delivery.findById(params.id)
    .populate({
      path: "order",
      populate: [
        { path: "user", select: "name email image" },
        { path: "shop", select: "name logo" }
      ]
    })
    .lean();

  return NextResponse.json(updatedDelivery);
}

