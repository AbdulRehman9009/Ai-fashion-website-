import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Shop from "@/models/Shop";
import Profile from "@/models/Profile";
import { updateProfileCompletionStatus } from "@/lib/profile-completion";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(session.user.id).lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let additionalData = {};

        // Get role-specific data
        if (user.role === "SHOPKEEPER") {
            const shop = await Shop.findOne({ owner: user._id }).lean();
            additionalData.shop = shop;
        }

        if (user.role === "USER") {
            const profile = await Profile.findOne({ user: user._id }).lean();
            additionalData.profile = profile;
        }

        return NextResponse.json({
            user,
            ...additionalData,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, phone, addresses, preferences, tailorProfile, deliveryProfile } = body;

        await connectDB();

        // Update basic user fields
        const updateData = {};
        if (name) updateData.name = name;
        if (session.user.role === "USER" && phone) updateData.phone = phone;

        // Update role-specific profiles
        if (session.user.role === "TAILOR" && tailorProfile) {
            updateData.tailorProfile = tailorProfile;
        }

        if (session.user.role === "DELIVERY" && deliveryProfile) {
            updateData.deliveryProfile = deliveryProfile;
        }

        const user = await User.findByIdAndUpdate(
            session.user.id,
            updateData,
            { new: true }
        );

        // Update/Create Profile for users
        if (session.user.role === "USER") {
            const profileData = {};
            if (phone) profileData.phone = phone;
            if (addresses) profileData.addresses = addresses;
            if (preferences) profileData.preferences = preferences;

            await Profile.findOneAndUpdate(
                { user: session.user.id },
                profileData,
                { upsert: true, new: true }
            );
        }

        // Update Shop for shopkeepers
        if (session.user.role === "SHOPKEEPER" && body.shop) {
            await Shop.findOneAndUpdate(
                { owner: session.user.id },
                body.shop,
                { upsert: true, new: true }
            );
        }

        // Update profile completion status
        await updateProfileCompletionStatus(session.user.id, session.user.role);

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
