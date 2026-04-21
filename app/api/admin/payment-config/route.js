import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPaymentConfig, updatePaymentConfig } from "@/lib/payment-distribution";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const config = await getPaymentConfig();
        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error("Error fetching payment config:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = await updatePaymentConfig(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, config: result.config });
    } catch (error) {
        console.error("Error updating payment config:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
