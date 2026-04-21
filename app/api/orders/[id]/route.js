import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Shop from "@/models/Shop";

export async function GET(req, { params }) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await Order.findById(id).populate("shop").populate("user").populate("items.product").lean();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ADMIN can see all orders
  if (token.role === "ADMIN") return NextResponse.json(order);

  // USER can only see their own orders
  if (token.role === "USER") {
    if (String(order.user?._id || order.user) !== token.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(order);
  }

  // SHOPKEEPER can see their shop's orders
  if (token.role === "SHOPKEEPER") {
    const shop = await Shop.findOne({ owner: token.sub }).select("_id").lean();
    if (shop && String(order.shop?._id || order.shop) === String(shop._id)) {
      return NextResponse.json(order);
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // TAILOR can see orders assigned to them
  if (token.role === "TAILOR") {
    if (String(order.assignedTailor) === token.sub) {
      return NextResponse.json(order);
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // DELIVERY can see orders with their delivery assignment
  if (token.role === "DELIVERY") {
    if (order.delivery) {
      const Delivery = (await import("@/models/Delivery")).default;
      const delivery = await Delivery.findById(order.delivery).select("assignedTo").lean();
      if (delivery && String(delivery.assignedTo) === token.sub) {
        return NextResponse.json(order);
      }
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
