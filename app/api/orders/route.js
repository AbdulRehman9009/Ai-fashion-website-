import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Shop from "@/models/Shop";
import { computePricing } from "@/lib/pricing";
import { createCheckoutSession } from "@/lib/paddle/paddleCheckout";

export async function GET(req) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = token.role;
  let orders;
  if (role === "ADMIN") {
    orders = await Order.find().sort({ createdAt: -1 }).populate("shop").populate("user").lean();
  } else if (role === "SHOPKEEPER") {
    const shops = await Shop.find({ owner: token.sub }).select("_id").lean();
    const shopIds = shops.map((s) => s._id);
    orders = await Order.find({ shop: { $in: shopIds } }).sort({ createdAt: -1 }).populate("user").lean();
  } else if (role === "USER") {
    orders = await Order.find({ user: token.sub }).sort({ createdAt: -1 }).populate("shop").lean();
  } else if (role === "DELIVERY") {
    orders = await Order.find({ status: { $in: ["DeliveryPending", "OutForPickup", "PickedUp", "OutForDelivery"] } })
      .sort({ createdAt: -1 })
      .populate("shop")
      .lean();
  } else if (role === "TAILOR") {
    orders = await Order.find({ status: { $in: ["TailoringPending", "TailoringInProgress"] } })
      .sort({ createdAt: -1 })
      .populate("shop")
      .lean();
  } else {
    orders = [];
  }
  return NextResponse.json(orders);
}

export async function POST(req) {
  await connectDB();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (token.role !== "USER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { items = [], shopId, tailoringRequests = [], urgent = false, deliveryZone = "standard", shippingAddress = {} } = body;

  if (!shopId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const shop = await Shop.findById(shopId).lean();
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) }, shop: shop._id }).lean();
  if (products.length !== items.length) return NextResponse.json({ error: "Product mismatch" }, { status: 400 });

  const orderItems = items.map((i) => {
    const p = products.find((pp) => String(pp._id) === String(i.productId));
    const unitPrice = p.basePrice;
    const totalPrice = unitPrice * i.quantity;
    return {
      product: p._id,
      quantity: i.quantity,
      unitPrice,
      totalPrice,
      // Pass Paddle Price ID for checkout if available
      paddlePriceId: p.paddlePriceId
    };
  });

  const pricing = computePricing({ items: orderItems, tailoringRequests, urgent, deliveryZone });

  // Create Order in "PaymentPending" state
  const order = await Order.create({
    user: token.sub,
    shop: shop._id,
    items: orderItems,
    tailoringRequests,
    urgent,
    pricing,
    status: "PaymentPending",
    paymentStatus: "PENDING",
    shippingAddress,
    timeline: [{ byRole: "USER", event: "OrderCreated" }],
  });

  // Generate Paddle Checkout Session
  try {
    const checkoutSession = await createCheckoutSession({
      orderId: order._id.toString(),
      items: orderItems.map(item => ({
        priceId: item.paddlePriceId, // Use the stored Paddle Price ID
        quantity: item.quantity
      })),
      customerEmail: token.email,
      customerName: token.name,
    });

    if (checkoutSession && checkoutSession.url) {
      // Update order with checkout ID for tracking
      order.paddleCheckoutId = checkoutSession.id;
      await order.save();

      return NextResponse.json({
        id: String(order._id),
        checkoutUrl: checkoutSession.url
      }, { status: 201 });
    } else {
      // Fallback or error handling if checkout generation fails
      // For now, return order ID but no URL (frontend should handle this)
      console.error("Failed to generate checkout URL", checkoutSession);
      return NextResponse.json({
        id: String(order._id),
        error: "Payment initialization failed. Please try again."
      }, { status: 201 }); // 201 because order *was* created, but payment failed init
    }
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json({
      id: String(order._id),
      error: "Payment initialization failed."
    }, { status: 201 });
  }
}
