import { connectDB } from "@/lib/db";
import Shop from "@/models/Shop";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const shop = await Shop.findById(id)
            .select('-owner -__v')
            .lean();

        if (!shop) {
            return NextResponse.json(
                { error: "Shop not found" },
                { status: 404 }
            );
        }

        if (!shop.isActive || !shop.isVisibleToCustomers) {
            return NextResponse.json(
                { error: "Shop not available" },
                { status: 404 }
            );
        }

        return NextResponse.json(shop);
    } catch (error) {
        console.error("Error fetching shop:", error);
        return NextResponse.json(
            { error: "Failed to fetch shop" },
            { status: 500 }
        );
    }
}
