import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Shop from "@/models/Shop";

// GET /api/admin/stats - Admin dashboard statistics
export async function GET(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // User statistics
        const totalUsers = await User.countDocuments();
        const usersByRole = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        const roleStats = {};
        usersByRole.forEach(item => {
            roleStats[item._id] = item.count;
        });

        // Order statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({
            status: { $in: ["OrderCreated", "PaymentPending", "TailoringPending", "DeliveryPending"] }
        });
        const completedOrders = await Order.countDocuments({ status: "Completed" });

        // Revenue statistics
        const orders = await Order.find({ status: "Completed" }).select("pricing createdAt").lean();
        const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.grandTotal || 0), 0);

        // This month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthOrders = orders.filter(o => new Date(o.createdAt) >= monthStart);
        const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.pricing?.grandTotal || 0), 0);

        // This week
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeekOrders = orders.filter(o => new Date(o.createdAt) >= weekStart);
        const thisWeekRevenue = thisWeekOrders.reduce((sum, order) => sum + (order.pricing?.grandTotal || 0), 0);

        // Pending actions
        const pendingPayments = await Order.countDocuments({ paymentStatus: "PENDING" });
        const pendingDeliveries = await Order.countDocuments({
            status: { $in: ["DeliveryPending", "OutForDelivery"] }
        });
        const tailorRequests = await Order.countDocuments({
            tailorAcceptanceStatus: "Pending"
        });

        // Shop count
        const totalShops = await Shop.countDocuments();

        const stats = {
            users: {
                total: totalUsers,
                byRole: {
                    USER: roleStats.USER || 0,
                    SHOPKEEPER: roleStats.SHOPKEEPER || 0,
                    TAILOR: roleStats.TAILOR || 0,
                    DELIVERY: roleStats.DELIVERY || 0,
                    ADMIN: roleStats.ADMIN || 0
                }
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders
            },
            revenue: {
                total: Math.round(totalRevenue),
                thisMonth: Math.round(thisMonthRevenue),
                thisWeek: Math.round(thisWeekRevenue)
            },
            shops: totalShops,
            pendingActions: {
                pendingPayments,
                pendingDeliveries,
                tailorRequests,
                total: pendingPayments + pendingDeliveries + tailorRequests
            }
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
