import { connectDB } from "@/lib/db";
import Shop from "@/models/Shop";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const city = searchParams.get("city");
        const category = searchParams.get("category");

        const query = {
            isActive: true,
            isVisibleToCustomers: true
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (city) {
            query['location.city'] = { $regex: city, $options: 'i' };
        }

        if (category) {
            query.categoryPermissions = category;
        }

        const shops = await Shop.find(query)
            .select('-owner -businessDetails.taxId -__v')
            .sort({ ratingAvg: -1, createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: shops,
            total: shops.length
        });
    } catch (error) {
        console.error("Error fetching shops:", error);
        return NextResponse.json(
            { error: "Failed to fetch shops" },
            { status: 500 }
        );
    }
}
