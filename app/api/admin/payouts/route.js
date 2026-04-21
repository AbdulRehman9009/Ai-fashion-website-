import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Earning from "@/models/Earning";
import Payout from "@/models/Payout";
import Order from "@/models/Order";

// GET: Fetch pending payouts for admin dashboard
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || "pending";

        // Fetch from Payout model (new system)
        const payouts = await Payout.find({ status })
            .populate("userId", "name email")
            .populate("orderId", "pricing status createdAt")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Get summary stats from Payout model
        const summary = await Payout.aggregate([
            { $match: { status: "pending" } },
            {
                $group: {
                    _id: "$providerRole",
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get total revenue from orders
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: "PAID" } },
            { $group: { _id: null, total: { $sum: "$pricing.grandTotal" } } }
        ]);

        return NextResponse.json({
            payouts: payouts.map(p => ({
                ...p,
                amount: p.amount / 100, // Convert cents to dollars
            })),
            pagination: {
                total: payouts.length
            },
            summary: {
                byRole: summary.reduce((acc, item) => {
                    acc[item._id] = {
                        amount: item.totalAmount / 100,
                        count: item.count
                    };
                    return acc;
                }, {}),
                totalPending: summary.reduce((acc, item) => acc + item.totalAmount, 0) / 100
            },
            totalRevenue: revenueResult[0]?.total || 0
        });
    } catch (error) {
        console.error("Error fetching payout candidates:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST: Process payout for specific users via Earning system
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userId, earningIds, payoutIds, reference } = body;

        await connectDB();

        // Option 1: Process via Earning IDs (legacy system)
        if (userId && earningIds && Array.isArray(earningIds) && earningIds.length > 0) {
            // FIXED: processPayoutBatch expects (userId, earningIds) — was called with 3 args
            const { processPayoutBatch } = await import("@/lib/paddle/paddlePayout");
            const result = await processPayoutBatch(userId, earningIds);
            return NextResponse.json(result);
        }

        // Option 2: Process via Payout IDs (new ledger system)
        if (payoutIds && Array.isArray(payoutIds) && payoutIds.length > 0) {
            const result = await Payout.updateMany(
                { _id: { $in: payoutIds }, status: "pending" },
                {
                    status: "paid_by_admin",
                    paidAt: new Date(),
                    paidBy: session.user.id,
                    notes: reference || ""
                }
            );

            return NextResponse.json({
                success: true,
                updated: result.modifiedCount
            });
        }

        return NextResponse.json({ error: "Provide either {userId, earningIds} or {payoutIds}" }, { status: 400 });
    } catch (error) {
        console.error("Error processing payouts:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH: Mark payouts as paid by admin
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { payoutIds, notes } = body;

        if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
            return NextResponse.json({ error: "Payout IDs required" }, { status: 400 });
        }

        await connectDB();

        const result = await Payout.updateMany(
            { _id: { $in: payoutIds }, status: "pending" },
            {
                status: "paid_by_admin",
                paidAt: new Date(),
                paidBy: session.user.id,
                notes: notes || ""
            }
        );

        return NextResponse.json({
            success: true,
            updated: result.modifiedCount
        });

    } catch (error) {
        console.error("Error marking payouts as paid:", error);
        return NextResponse.json({ error: "Failed to update payouts" }, { status: 500 });
    }
}
