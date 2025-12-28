import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Delivery from "@/models/Delivery";

export async function GET(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "DELIVERY") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Fetch all deliveries for this delivery person
        const deliveries = await Delivery.find({ assignedTo: token.sub })
            .populate("order")
            .lean();

        // Calculate earnings
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let todayEarnings = 0;
        let weekEarnings = 0;
        let totalEarnings = 0;
        let pendingEarnings = 0;
        let paidEarnings = 0;

        let completedCount = 0;
        let pendingCount = 0;

        deliveries.forEach(delivery => {
            if (delivery.status === "Delivered") {
                const earnings = delivery.fee + delivery.urgentBonus;
                const deliveredAt = delivery.confirmedAt || delivery.updatedAt;

                completedCount++;
                totalEarnings += earnings;

                if (delivery.paymentStatus === "Paid") {
                    paidEarnings += earnings;
                } else {
                    pendingEarnings += earnings;
                }

                // Check if delivered today
                if (deliveredAt >= todayStart) {
                    todayEarnings += earnings;
                }

                // Check if delivered this week
                if (deliveredAt >= weekStart) {
                    weekEarnings += earnings;
                }
            } else {
                pendingCount++;
            }
        });

        return NextResponse.json({
            today: todayEarnings,
            thisWeek: weekEarnings,
            total: totalEarnings,
            pending: pendingEarnings,
            paid: paidEarnings,
            deliveries: {
                completed: completedCount,
                pending: pendingCount,
                total: deliveries.length
            }
        });
    } catch (error) {
        console.error("Error calculating earnings:", error);
        return NextResponse.json({ error: "Failed to calculate earnings" }, { status: 500 });
    }
}
