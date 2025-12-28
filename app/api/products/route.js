import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Shop from "@/models/Shop";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPaddleProduct, updatePaddleProduct, archivePaddleProduct } from "@/lib/paddle/paddleClient";

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

  const products = await Product.find(query)
    .populate('shop', 'name logo location isActive isVisibleToCustomers')
    .sort({ createdAt: -1 })
    .lean();

  // Filter out products from inactive or hidden shops
  const visibleProducts = products.filter(p =>
    p.shop && p.shop.isActive && p.shop.isVisibleToCustomers
  );

  return NextResponse.json(visibleProducts);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();

  const shop = await Shop.findOne({ owner: session.user.id });

  if (!shop) {
    return NextResponse.json({ error: "Shop not found for this user" }, { status: 404 });
  }

  try {
    // 1. Create Product in DB first
    const product = await Product.create({ ...body, shop: shop._id });

    // 2. Sync with Paddle
    try {
      const paddleResult = await createPaddleProduct({
        name: product.name,
        description: product.description,
        price: product.basePrice,
        currency: "USD",
        category: product.category,
        imageUrl: product.images?.[0]
      });

      if (paddleResult.success) {
        product.paddleProductId = paddleResult.productId;
        product.paddlePriceId = paddleResult.priceId;
        product.paddleSyncStatus = "synced";
      } else {
        product.paddleSyncStatus = "failed";
        product.paddleSyncError = paddleResult.error;
        console.error("Paddle Sync Failed:", paddleResult.error);
      }
      await product.save();
    } catch (syncError) {
      console.error("Paddle Sync Error:", syncError);
      product.paddleSyncStatus = "failed";
      product.paddleSyncError = syncError.message;
      await product.save();
    }

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

  const product = await Product.findById(_id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const shop = await Shop.findById(product.shop);
  if (!shop || shop.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // 1. Update DB
    const updated = await Product.findByIdAndUpdate(_id, updates, { new: true });

    // 2. Sync with Paddle (if critical fields changed)
    if (updates.name || updates.basePrice || updates.description) {
      try {
        const paddleResult = await updatePaddleProduct(updated.paddleProductId, updated.paddlePriceId, {
          name: updated.name,
          price: updated.basePrice,
          currency: "USD", // Assuming USD for now
          description: updated.description,
          imageUrl: updated.images?.[0]
        });

        if (paddleResult.success) {
          updated.paddlePriceId = paddleResult.priceId || updated.paddlePriceId; // Price change creates new ID
          updated.paddleSyncStatus = "synced";
          updated.paddleSyncError = null;
        } else {
          updated.paddleSyncStatus = "failed";
          updated.paddleSyncError = paddleResult.error;
        }
        await updated.save();
      } catch (syncError) {
        console.error("Paddle Update Error:", syncError);
      }
    }

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

  try {
    // Archive in Paddle
    if (product.paddleProductId) {
      await archivePaddleProduct(product.paddleProductId);
    }
  } catch (error) {
    console.error("Paddle Archive Error:", error);
    // Proceed with deletion anyway
  }

  await Product.findByIdAndDelete(id);
  return NextResponse.json({ message: "Deleted" });
}
