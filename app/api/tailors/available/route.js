import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// GET - Fetch available tailors for assignment
export async function GET(req) {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only shopkeepers and admins can view available tailors
    if (!["SHOPKEEPER", "ADMIN"].includes(token.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const tailors = await User.find({
            role: "TAILOR",
            status: "ACTIVE",
            "tailorProfile.availability": true,
        })
            .select("_id name email tailorProfile.specialization tailorProfile.ratingAvg tailorProfile.experience tailorProfile.pricePerJob")
            .lean();

        return NextResponse.json({
            success: true,
            data: tailors.map(t => ({
                _id: t._id,
                name: t.name || t.email.split("@")[0],
                email: t.email,
                specialization: t.tailorProfile?.specialization || [],
                rating: t.tailorProfile?.ratingAvg || 0,
                experience: t.tailorProfile?.experience || 0,
                pricePerJob: t.tailorProfile?.pricePerJob || 0,
            })),
            count: tailors.length
        });
    } catch (error) {
        console.error("Error fetching available tailors:", error);
        return NextResponse.json({ error: "Failed to fetch tailors" }, { status: 500 });
    }
}
