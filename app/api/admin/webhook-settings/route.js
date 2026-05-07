import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SystemConfig from "@/models/SystemConfig";
import { withErrorHandler, withAuth } from "@/lib/api-middleware";

async function GET(req) {
    await connectDB();
    const cfg = await SystemConfig.findOne({ key: "paddle.webhook" }).lean();
    return NextResponse.json({ success: true, data: cfg ? cfg.value : { secret: "", verifyEnabled: true } });
}

async function PUT(req) {
    await connectDB();
    const body = await req.json();
    const value = {
        secret: body.secret || "",
        verifyEnabled: body.verifyEnabled !== false,
    };

    const updated = await SystemConfig.findOneAndUpdate(
        { key: "paddle.webhook" },
        { $set: { value, description: "Paddle webhook settings" } },
        { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: updated.value });
}

const adminAuth = (handler) => withAuth(handler, { roles: ["ADMIN"] });

export const GET = withErrorHandler(adminAuth(GET));
export const PUT = withErrorHandler(adminAuth(PUT));
