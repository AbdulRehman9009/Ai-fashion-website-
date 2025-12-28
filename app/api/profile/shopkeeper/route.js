import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Shop from "@/models/Shop";
import { checkProfileCompletion } from "@/lib/profile-completion";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SHOPKEEPER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await connectDB();

        // Create or update Shop document
        let shop = await Shop.findOne({ owner: session.user.id });

        if (!shop) {
            shop = new Shop({
                owner: session.user.id,
                name: body.businessName,
                "location.address": body.address,
                "location.city": body.city,
                "businessDetails.ownerName": body.ownerName,
                "businessDetails.phone": body.phone,
                "businessDetails.taxId": body.taxId,
                categoryPermissions: body.categoryPermissions,
                "commissionAgreement.percentage": 10,
                "commissionAgreement.agreedToTerms": body.agreedToTerms,
                "commissionAgreement.agreedAt": new Date(),
            });
        } else {
            shop.name = body.businessName;
            shop.location.address = body.address;
            shop.location.city = body.city;
            shop.businessDetails.ownerName = body.ownerName;
            shop.businessDetails.phone = body.phone;
            shop.businessDetails.taxId = body.taxId;
            shop.categoryPermissions = body.categoryPermissions;
            shop.commissionAgreement.agreedToTerms = body.agreedToTerms;
            shop.commissionAgreement.agreedAt = new Date();
        }

        await shop.save();

        // Update user name and bank details
        const userUpdates = {
            name: body.ownerName,
        };

        if (body.payoutMethod) {
            userUpdates.payoutMethod = body.payoutMethod;
        }

        await User.findByIdAndUpdate(session.user.id, userUpdates);

        // Recalculate profile completion using new Paddle-compatible logic
        const status = await checkProfileCompletion(session.user.id, "SHOPKEEPER");

        // Update Shop profile completion
        await Shop.findByIdAndUpdate(shop._id, {
            "profileCompletion.isComplete": status.isComplete,
            "profileCompletion.percentage": status.percentage,
            "profileCompletion.missingFields": status.missingFields,
        });

        // Update User profile completion
        await User.findByIdAndUpdate(session.user.id, {
            "profileCompletion.isComplete": status.isComplete,
            "profileCompletion.percentage": status.percentage,
            "profileCompletion.missingFields": status.missingFields,
            "profileCompletion.lastChecked": new Date(),
        });

        return NextResponse.json({
            success: true,
            completion: status,
        });
    } catch (error) {
        console.error("Error submitting shopkeeper profile:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
