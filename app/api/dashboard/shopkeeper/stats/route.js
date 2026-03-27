import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Shop from "@/models/Shop";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SHOPKEEPER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find shop by owner — lean for speed
    const shop = await Shop.findOne({ owner: session.user.id }).select("_id").lean();
    if (!shop) {
        return NextResponse.json({ totalProducts: 0, activeOrders: 0, lowStockProducts: 0, revenue: 0 });
    }

    const shopId = shop._id;

    // Run all stats queries in parallel — avoids sequential DB round-trips
    const ACTIVE_STATUSES = [
        "OrderCreated", "PaymentConfirmed", "TailoringPending",
        "TailoringInProgress", "DeliveryPending", "OutForPickup", "OutForDelivery"
    ];

    const [totalProducts, activeOrders, lowStockProducts, revenueResult] = await Promise.all([
        Product.countDocuments({ shop: shopId, isActive: { $ne: false } }),
        Order.countDocuments({ shop: shopId, status: { $in: ACTIVE_STATUSES } }),
        Product.countDocuments({ shop: shopId, stock: { $lt: 5, $gt: 0 } }),
        Order.aggregate([
            { $match: { shop: shopId, paymentStatus: "PAID" } },
            { $group: { _id: null, total: { $sum: "$pricing.grandTotal" } } }
        ])
    ]);

    return NextResponse.json({
        totalProducts,
        activeOrders,
        lowStockProducts,
        revenue: revenueResult[0]?.total || 0
    });
}
