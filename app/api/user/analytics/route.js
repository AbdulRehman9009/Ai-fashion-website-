import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Get all orders for the user
        const orders = await Order.find({ customer: session.user.id })
            .populate("shop", "name")
            .sort({ createdAt: -1 })
            .lean();

        // Calculate analytics
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
        const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;
        const activeOrders = orders.filter(
            (o) => !["COMPLETED", "CANCELLED", "REFUNDED"].includes(o.status)
        ).length;

        // Get recent orders (last 5)
        const recentOrders = orders.slice(0, 5);

        // Calculate favorite shops
        const shopStats = {};
        orders.forEach((order) => {
            if (order.shop) {
                const shopId = order.shop._id?.toString() || order.shop.toString();
                if (!shopStats[shopId]) {
                    shopStats[shopId] = {
                        _id: shopId,
                        name: order.shop.name || "Unknown Shop",
                        orderCount: 0,
                        totalSpent: 0,
                    };
                }
                shopStats[shopId].orderCount++;
                shopStats[shopId].totalSpent += order.grandTotal || 0;
            }
        });

        const favoriteShops = Object.values(shopStats)
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, 5);

        return NextResponse.json({
            totalOrders,
            totalSpent,
            averageOrder,
            activeOrders,
            recentOrders,
            favoriteShops,
        });
    } catch (error) {
        console.error("Error fetching user analytics:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
