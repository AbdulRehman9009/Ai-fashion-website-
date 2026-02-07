import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/**
 * GET /api/delivery-personnel
 * Fetches available delivery personnel for assignment
 * Query params:
 *   - city: Filter by city
 *   - available: Filter by availability (true/false)
 */
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Build query for delivery personnel
        const query = {
            role: "DELIVERY",
            status: "ACTIVE"
        };

        const { searchParams } = new URL(request.url);

        // Filter by availability
        const available = searchParams.get("available");
        if (available === "true") {
            query["deliveryProfile.availability"] = true;
        }

        // Filter by city
        const city = searchParams.get("city");
        if (city) {
            query["deliveryProfile.serviceAreas"] = {
                $elemMatch: { $regex: city, $options: "i" }
            };
        }

        const deliveryPersonnel = await User.find(query)
            .select("name email image phone deliveryProfile")
            .sort({ "deliveryProfile.ratingAvg": -1 })
            .lean();

        // Transform data for frontend
        const formattedPersonnel = deliveryPersonnel.map(person => ({
            _id: person._id,
            name: person.name || "Unnamed",
            email: person.email,
            image: person.image,
            phone: person.phone || person.deliveryProfile?.contact?.phone,
            availability: person.deliveryProfile?.availability || false,
            vehicleType: person.deliveryProfile?.vehicleType || "Bike",
            serviceAreas: person.deliveryProfile?.serviceAreas || [],
            ratingAvg: person.deliveryProfile?.ratingAvg || 0,
            ratingCount: person.deliveryProfile?.ratingCount || 0,
            totalDeliveries: person.deliveryProfile?.totalDeliveries || 0,
            perDeliveryFee: person.deliveryProfile?.perDeliveryFee || 5 // Default fee
        }));

        return NextResponse.json(formattedPersonnel);
    } catch (error) {
        console.error("Error fetching delivery personnel:", error);
        return NextResponse.json(
            { error: "Failed to fetch delivery personnel" },
            { status: 500 }
        );
    }
}
