import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { checkProfileCompletion } from "@/lib/profile-completion";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "TAILOR") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await connectDB();

        // Update User model
        const userUpdate = {
            name: body.name,
            "tailorProfile.phone": body.phone,
            "tailorProfile.cnicId": body.cnicId,
            "tailorProfile.location.address": body.address,
            "tailorProfile.location.city": body.city,
            "tailorProfile.specialization": body.specialization,
            "tailorProfile.experience": body.experience,
            "tailorProfile.pricePerJob": body.pricePerJob,
            "tailorProfile.commissionPercentage": body.commissionPercentage,
            "tailorProfile.availability": body.availability,
            "tailorProfile.agreedToTerms": body.agreedToTerms,
            "tailorProfile.termsAgreedAt": new Date(),
        };

        // Save bank details if provided
        if (body.payoutMethod) {
            userUpdate.payoutMethod = body.payoutMethod;
        }

        await User.findByIdAndUpdate(session.user.id, userUpdate);

        // Recalculate profile completion
        const status = await checkProfileCompletion(session.user.id, "TAILOR");

        await User.findByIdAndUpdate(session.user.id, {
            "profileCompletion.isComplete": status.isComplete,
            "profileCompletion.percentage": status.percentage,
            "profileCompletion.missingFields": status.missingFields,
            "profileCompletion.lastChecked": new Date(),
        });

        return NextResponse.json({ success: true, completion: status });
    } catch (error) {
        console.error("Error submitting tailor profile:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
