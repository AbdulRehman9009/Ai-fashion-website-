import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Shop from "@/models/Shop";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Need to ensure path is correct

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const shopId = searchParams.get("shop"); // Optional filter

  // If Shopkeeper, return *their* products.
  if (role === "SHOPKEEPER") {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SHOPKEEPER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shop = await Shop.findOne({ owner: session.user.id });
    if (!shop) return NextResponse.json([]);
    const products = await Product.find({ shop: shop._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(products);
  }

  // Public/User view (can filter by explicit shopId)
  const query = {};
  if (shopId) query.shop = shopId;

  const products = await Product.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(products);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();

  // Fix: Find shop owned by this user
  const shop = await Shop.findOne({ owner: session.user.id });

  if (!shop) {
    return NextResponse.json({ error: "Shop not found for this user" }, { status: 404 });
  }

  try {
    const product = await Product.create({ ...body, shop: shop._id });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const { _id, ...updates } = body;

  // Ensure product belongs to shop owned by user
  const product = await Product.findById(_id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const shop = await Shop.findById(product.shop);
  if (!shop || shop.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const updated = await Product.findByIdAndUpdate(_id, updates, { new: true });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const shop = await Shop.findById(product.shop);
  if (!shop || shop.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await Product.findByIdAndDelete(id);
  return NextResponse.json({ message: "Deleted" });
}
