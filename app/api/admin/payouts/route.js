import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Earning from "@/models/Earning";
import { processPayoutBatch } from "@/lib/paddle/paddlePayout";

// GET: Fetch all users with available earnings for payout
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Aggregate earnings by user where status is 'available'
        const payoutCandidates = await Earning.aggregate([
            { $match: { status: "available" } },
            {
                $group: {
                    _id: "$user",
                    totalAmount: { $sum: "$amount" },
                    earningsCount: { $sum: 1 },
                    lastEarningDate: { $max: "$createdAt" }
                }
            }
        ]);

        // Populate user details including bank info
        const populatedCandidates = await User.populate(payoutCandidates, {
            path: "_id",
            select: "name email role payoutMethod"
        });

        // Format for frontend
        const formatted = populatedCandidates.map(item => ({
            userId: item._id._id,
            name: item._id.name,
            email: item._id.email,
            role: item._id.role,
            amount: item.totalAmount,
            count: item.earningsCount,
            lastEarning: item.lastEarningDate,
            payoutMethod: item._id.payoutMethod || { type: "unknown" }
        }));

        return NextResponse.json({ candidates: formatted });
    } catch (error) {
        console.error("Error fetching payout candidates:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST: Process payout for specific users
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userIds, reference } = await req.json();

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: "Invalid user IDs" }, { status: 400 });
        }

        await connectDB();

        // Process payouts using our library
        const result = await processPayoutBatch(userIds, session.user.id, reference);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error processing payouts:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
