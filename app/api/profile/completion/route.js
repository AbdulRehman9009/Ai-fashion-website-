import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { checkProfileCompletion } from "@/lib/profile-completion";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const status = await checkProfileCompletion(session.user.id, session.user.role);

        return NextResponse.json(status);
    } catch (error) {
        console.error("Error checking profile completion:", error);
        return NextResponse.json(
            { error: "Failed to check profile completion" },
            { status: 500 }
        );
    }
}
