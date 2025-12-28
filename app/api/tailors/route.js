import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// GET /api/tailors - Browse available tailors (for shopkeepers)
export async function GET(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only shopkeepers can browse tailors
    if (token.role !== "SHOPKEEPER" && token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city");
        const available = searchParams.get("available");

        // Build query
        const query = { role: "TAILOR", status: "ACTIVE" };

        if (city) {
            query["tailorProfile.location.city"] = new RegExp(city, "i");
        }

        if (available === "true") {
            query["tailorProfile.availability"] = true;
        }

        const tailors = await User.find(query)
            .select("name email image tailorProfile createdAt")
            .sort({ "tailorProfile.ratingAvg": -1, createdAt: -1 })
            .lean();

        return NextResponse.json(tailors);
    } catch (error) {
        console.error("Error fetching tailors:", error);
        return NextResponse.json({ error: "Failed to fetch tailors" }, { status: 500 });
    }
}
