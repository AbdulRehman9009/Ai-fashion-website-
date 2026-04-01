import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
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

  // Check Profile Completion
  const user = await User.findById(token.sub).select("profileCompletion").lean();
  if (!user || !user.profileCompletion?.isComplete) {
    return NextResponse.json({
      error: "Profile incomplete. Please complete your profile to place an order.",
      redirect: "/dashboard/complete-profile"
    }, { status: 403 });
  }

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

  // Generate Paddle Checkout Session using INLINE pricing
  // No paddlePriceId needed — we pass the order total directly
  try {
    const itemNames = products.map(p => p.title || p.name).join(", ");
    const checkoutSession = await createCheckoutSession({
      orderId: order._id.toString(),
      orderName: `Order from ${shop.name || "Style Genie"}`,
      orderDescription: itemNames.length > 200 ? itemNames.slice(0, 197) + "..." : itemNames,
      totalAmount: pricing.grandTotal,
      currency: pricing.currency || "USD",
      customerEmail: token.email,
      successUrl: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${order._id}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/checkout`
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
      // No Paddle checkout URL - allow COD (Cash on Delivery)
      console.log("Paddle checkout not available - proceeding with COD option");
      return NextResponse.json({
        id: String(order._id),
        paymentMethod: "COD",
        message: "Order created successfully. Pay on delivery."
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Checkout creation error:", error);
    // Order was created, proceed with COD
    return NextResponse.json({
      id: String(order._id),
      paymentMethod: "COD",
      message: "Order created. Pay on delivery."
    }, { status: 201 });
  }
}
