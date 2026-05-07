import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { connectDB } from "./db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const DAILY_AI_LIMIT = 5;

export async function checkAiLimit() {
    const session = await getServerSession(authOptions);
    if (!session) return { allowed: false, error: "Unauthorized" };

    await connectDB();
    const user = await User.findById(session.user.id).select("aiUsageCount lastAiUsageDate role").lean();

    if (user.role === "ADMIN") return { allowed: true, remaining: Infinity };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastUsage = user.lastAiUsageDate ? new Date(user.lastAiUsageDate) : null;

    if (!lastUsage || lastUsage < today) {
        return { allowed: true, remaining: DAILY_AI_LIMIT, user };
    }

    if (user.aiUsageCount >= DAILY_AI_LIMIT) {
        return { allowed: false, error: `Daily AI limit reached (${DAILY_AI_LIMIT} uses/day). Upgrade to premium for more.` };
    }

    return { allowed: true, remaining: DAILY_AI_LIMIT - user.aiUsageCount, user };
}

export async function incrementAiUsage(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await connectDB();
    const user = await User.findById(userId).select("aiUsageCount lastAiUsageDate");

    if (!user) return;

    const lastUsage = user.lastAiUsageDate ? new Date(user.lastAiUsageDate) : null;

    if (!lastUsage || lastUsage < today) {
        user.aiUsageCount = 1;
        user.lastAiUsageDate = new Date();
    } else {
        user.aiUsageCount += 1;
        user.lastAiUsageDate = new Date();
    }

    await user.save();
}
