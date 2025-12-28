import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Profile from "@/models/Profile";
import { validateCustomerProfile } from "@/lib/profileValidation";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "USER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await connectDB();

        // Update User model
        const userUpdate = {
            name: body.name,
            "customerProfile.measurementPreference": body.measurementPreference,
            "customerProfile.defaultPaymentMethod": body.defaultPaymentMethod,
            "customerProfile.agreedToTerms": body.agreedToTerms,
            "customerProfile.termsAgreedAt": new Date(),
        };

        await User.findByIdAndUpdate(session.user.id, userUpdate);

        // Update or create Profile
        const profileData = {
            name: body.name,
            phone: body.phone,
            addresses: [body.address],
            termsAccepted: body.agreedToTerms,
            termsAcceptedAt: new Date(),
            refundPolicyAccepted: body.agreedToTerms,
            refundPolicyAcceptedAt: new Date(),
        };

        await Profile.findOneAndUpdate(
            { user: session.user.id },
            profileData,
            { upsert: true, new: true }
        );

        // Recalculate profile completion
        const user = await User.findById(session.user.id);
        const profile = await Profile.findOne({ user: session.user.id });
        const completion = validateCustomerProfile(user, profile);

        await User.findByIdAndUpdate(session.user.id, {
            "profileCompletion.isComplete": completion.isComplete,
            "profileCompletion.percentage": completion.percentage,
            "profileCompletion.missingFields": completion.missingFields,
            "profileCompletion.lastChecked": new Date(),
        });

        return NextResponse.json({ success: true, completion });
    } catch (error) {
        console.error("Error submitting customer profile:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
