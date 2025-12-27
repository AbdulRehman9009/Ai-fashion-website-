import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Assuming this is where authOptions are, checking if I need to find it exactly
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Shop from "@/models/Shop"; // Assuming I need to find the shop by user

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SHOPKEEPER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the shop owned by this user
    const shop = await Shop.findOne({ owner: session.user.id });
    if (!shop) {
        return NextResponse.json({
            totalProducts: 0,
            activeOrders: 0,
            lowStockProducts: 0,
            revenue: 0,
            weeklyStats: []
        });
    }

    const shopId = shop._id;

    // 1. Total Products
    const totalProducts = await Product.countDocuments({ shop: shopId });

    // 2. Active Orders (Pending, Accepted, Stitching, DeliveryPending, OutForDelivery)
    const activeOrders = await Order.countDocuments({
        shop: shopId,
        status: { $in: ["OrderCreated", "PaymentConfirmed", "TailoringPending", "TailoringInProgress", "DeliveryPending", "OutForPickup", "OutForDelivery"] }
    });

    // 3. Low Stock (< 5)
    const lowStockProducts = await Product.countDocuments({ shop: shopId, stock: { $lt: 5 } });

    // 4. Total Revenue (Completed orders)
    // Assuming 'grandTotal' is in 'pricing' and paymentStatus is 'PAID' or status is 'Completed'
    const revenueResult = await Order.aggregate([
        { $match: { shop: shopId, paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$pricing.grandTotal" } } }
    ]);
    const revenue = revenueResult[0]?.total || 0;

    return NextResponse.json({
        totalProducts,
        activeOrders,
        lowStockProducts,
        revenue
    });
}
