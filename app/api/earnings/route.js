import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getEarningsSummary, getAvailableEarnings } from "@/lib/paddle/paddlePayout";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const summary = await getEarningsSummary(session.user.id);
        const available = await getAvailableEarnings(session.user.id);

        // Also fetch recent earnings history
        const Earning = (await import("@/models/Earning")).default;
        const history = await Earning.find({ user: session.user.id })
            .sort({ createdAt: -1 })
            .populate("order", "_id grandTotal")
            .limit(20)
            .lean();

        return NextResponse.json({
            summary: summary.summary,
            availableBalance: available.totalAmount,
            history
        });
    } catch (error) {
        console.error("Error fetching earnings:", error);
        return NextResponse.json(
            { error: "Failed to fetch earnings" },
            { status: 500 }
        );
    }
}
