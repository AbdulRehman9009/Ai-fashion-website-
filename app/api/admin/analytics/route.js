import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Shop from "@/models/Shop";
import User from "@/models/User";

// GET /api/admin/analytics - Analytics data for charts
export async function GET(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get("days") || "30");

        // Get orders from last N days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const orders = await Order.find({
            createdAt: { $gte: startDate }
        }).select("pricing status createdAt shop assignedTailor").lean();

        // Revenue by day
        const revenueByDay = {};
        const ordersByDay = {};

        orders.forEach(order => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            revenueByDay[date] = (revenueByDay[date] || 0) + (order.pricing?.grandTotal || 0);
            ordersByDay[date] = (ordersByDay[date] || 0) + 1;
        });

        const revenueData = Object.keys(revenueByDay).map(date => ({
            date,
            revenue: Math.round(revenueByDay[date])
        })).sort((a, b) => a.date.localeCompare(b.date));

        const ordersData = Object.keys(ordersByDay).map(date => ({
            date,
            orders: ordersByDay[date]
        })).sort((a, b) => a.date.localeCompare(b.date));

        // Top shops by revenue
        const shopRevenue = {};
        orders.forEach(order => {
            if (order.shop) {
                const shopId = order.shop.toString();
                shopRevenue[shopId] = (shopRevenue[shopId] || 0) + (order.pricing?.grandTotal || 0);
            }
        });

        const topShopIds = Object.entries(shopRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([id]) => id);

        const shops = await Shop.find({ _id: { $in: topShopIds } }).select("name").lean();
        const topShops = topShopIds.map(id => {
            const shop = shops.find(s => s._id.toString() === id);
            return {
                name: shop?.name || "Unknown",
                revenue: Math.round(shopRevenue[id])
            };
        });

        // Top tailors by order count
        const tailorOrders = {};
        orders.forEach(order => {
            if (order.assignedTailor) {
                const tailorId = order.assignedTailor.toString();
                tailorOrders[tailorId] = (tailorOrders[tailorId] || 0) + 1;
            }
        });

        const topTailorIds = Object.entries(tailorOrders)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([id]) => id);

        const tailors = await User.find({ _id: { $in: topTailorIds } }).select("name").lean();
        const topTailors = topTailorIds.map(id => {
            const tailor = tailors.find(t => t._id.toString() === id);
            return {
                name: tailor?.name || "Unknown",
                orders: tailorOrders[id]
            };
        });

        // Order status distribution
        const statusDistribution = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const analytics = {
            revenueByDay: revenueData,
            ordersByDay: ordersData,
            topShops,
            topTailors,
            statusDistribution: statusDistribution.map(item => ({
                status: item._id,
                count: item.count
            }))
        };

        return NextResponse.json(analytics);
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
