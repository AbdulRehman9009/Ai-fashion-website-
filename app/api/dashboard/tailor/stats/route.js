import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req) {
    try {
        await connectDB();
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token || token.role !== "TAILOR") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tailorId = token.sub;

        // Fetch tailor user to get rating
        const tailorUser = await User.findById(tailorId).select("ratingAvg").lean();
        const avgRating = tailorUser?.ratingAvg || 4.9;

        // Fetch all orders assigned to this tailor
        const orders = await Order.find({ assignedTailor: tailorId }).populate("items.product").lean();

        const totalOrders = orders.length;
        const completed = orders.filter(o => ["TailoringCompleted", "DeliveryPending", "Completed", "Delivered", "stitched"].includes(o.status)).length;
        const inProgress = orders.filter(o => o.status === "TailoringInProgress").length;
        const pending = orders.filter(o => ["TailoringPending", "OrderCreated", "PaymentConfirmed"].includes(o.status)).length;
        const completionRate = totalOrders > 0 ? Math.round((completed / totalOrders) * 100) : 100;

        // Group by month (last 6 months)
        const chartDataMap = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mName = months[d.getMonth()];
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            chartDataMap[key] = { month: mName, total: 0, completed: 0, pending: 0 };
        }

        // Fill chart data
        orders.forEach(o => {
            const date = new Date(o.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (chartDataMap[key]) {
                chartDataMap[key].total += 1;
                if (["TailoringCompleted", "DeliveryPending", "Completed", "Delivered", "stitched"].includes(o.status)) {
                    chartDataMap[key].completed += 1;
                } else {
                    chartDataMap[key].pending += 1;
                }
            }
        });

        const chartData = Object.keys(chartDataMap)
            .sort()
            .map(k => chartDataMap[k]);

        // Aggregate specializations from order items
        const specMap = {};
        orders.forEach(o => {
            o.items.forEach(item => {
                const category = item.product?.category || "General Wear";
                specMap[category] = (specMap[category] || 0) + 1;
            });
        });

        const popularSpecializations = Object.entries(specMap)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 100
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        // Fallback popular specs if empty
        if (popularSpecializations.length === 0) {
            popularSpecializations.push(
                { name: "Wedding Attire", count: 0, percentage: 0 },
                { name: "Formal Wear", count: 0, percentage: 0 },
                { name: "Casual Wear", count: 0, percentage: 0 }
            );
        }

        return NextResponse.json({
            stats: {
                totalOrders,
                completed,
                inProgress,
                pending,
                avgRating,
                completionRate
            },
            chartData,
            popularSpecializations
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
