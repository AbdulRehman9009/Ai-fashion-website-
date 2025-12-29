import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Profile from "@/models/Profile";
import { checkProfileCompletion } from "@/lib/profile-completion";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "USER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const profile = await Profile.findOne({ user: session.user.id });
        const user = await User.findById(session.user.id).select('name email phone');

        if (!profile) {
            // Return minimal info if profile doesn't exist yet
            return NextResponse.json({
                name: user?.name,
                email: user?.email,
                customerProfile: {
                    phone: user?.phone || "",
                    address: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    measurements: {
                        height: "",
                        weight: "",
                        shirtSize: "",
                        pantSize: "",
                        shoeSize: "",
                    },
                    preferences: {
                        style: "",
                        newsletter: true
                    }
                }
            });
        }

        // Map database profile to form format
        const responseData = {
            name: user?.name || profile.name,
            email: user?.email,
            customerProfile: {
                phone: profile.phone || user?.phone || "",
                address: profile.addresses?.[0]?.street || "",
                city: profile.addresses?.[0]?.city || "",
                state: profile.addresses?.[0]?.state || "",
                zipCode: profile.addresses?.[0]?.zip || "",
                measurements: {
                    height: profile.measurements?.height || "",
                    weight: profile.measurements?.weight || "",
                    shirtSize: profile.measurements?.shirtSize || "",
                    pantSize: profile.measurements?.pantSize || "",
                    shoeSize: profile.measurements?.shoeSize || "",
                },
                preferences: {
                    style: profile.preferences?.styles?.[0] || "",
                    newsletter: profile.preferences?.newsletter ?? true
                }
            }
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Error fetching customer profile:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "USER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, customerProfile } = body;

        if (!customerProfile) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        await connectDB();

        // Update User model (Basic user info)
        const userUpdate = {
            name: name,
        };

        await User.findByIdAndUpdate(session.user.id, userUpdate);

        // Update or create Profile (Detailed info)
        const profileData = {
            name: name,
            phone: customerProfile.phone,
            addresses: [
                {
                    street: customerProfile.address,
                    city: customerProfile.city,
                    state: customerProfile.state,
                    zip: customerProfile.zipCode,
                    country: "USA", // Default or add to form
                    isDefault: true,
                }
            ],
            measurements: {
                height: Number(customerProfile.measurements?.height),
                weight: Number(customerProfile.measurements?.weight),
                shirtSize: customerProfile.measurements?.shirtSize,
                pantSize: Number(customerProfile.measurements?.pantSize),
                shoeSize: Number(customerProfile.measurements?.shoeSize),
            },
            preferences: {
                styles: customerProfile.preferences?.style ? [customerProfile.preferences.style] : [],
                newsletter: customerProfile.preferences?.newsletter
            },
            termsAccepted: true, // Form enforces this
            termsAcceptedAt: new Date(),
        };

        await Profile.findOneAndUpdate(
            { user: session.user.id },
            profileData,
            { upsert: true, new: true }
        );

        // Recalculate profile completion
        const completion = await checkProfileCompletion(session.user.id, "USER");

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
