import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Profile from "@/models/Profile";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Get user for basic info
        const user = await User.findById(session.user.id)
            .select("name")
            .lean();

        // Get profile with addresses
        const profile = await Profile.findOne({ user: session.user.id })
            .select("name phone addresses")
            .lean();

        if (!profile) {
            return NextResponse.json({
                hasShippingData: false,
                shippingAddress: null
            });
        }

        // Get default address or first address
        const defaultAddress = profile.addresses?.find(a => a.isDefault)
            || profile.addresses?.[0]
            || null;

        // Map profile data to shipping address format
        const shippingAddress = {
            name: profile.name || user?.name || session.user.name || "",
            email: session.user.email || "",
            phone: profile.phone || "",
            street: defaultAddress?.street || "",
            city: defaultAddress?.city || "",
            state: defaultAddress?.state || "",
            zip: defaultAddress?.zip || "",
            country: defaultAddress?.country || "Pakistan"
        };

        // Check if profile has minimum shipping data
        const hasShippingData = !!(
            shippingAddress.name &&
            shippingAddress.phone &&
            shippingAddress.street &&
            shippingAddress.city
        );

        return NextResponse.json({
            hasShippingData,
            shippingAddress,
            profileComplete: hasShippingData
        });

    } catch (error) {
        console.error("Error fetching shipping profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch shipping data" },
            { status: 500 }
        );
    }
}
