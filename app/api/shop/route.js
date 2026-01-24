import { connectDB } from "@/lib/db";
import Shop from "@/models/Shop";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SHOPKEEPER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const shop = await Shop.findOne({ owner: session.user.id });

    if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    return NextResponse.json(shop);
}

export async function PUT(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SHOPKEEPER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // We update fields that are allowed
    // name, description, logo, banner, location...

    const shop = await Shop.findOneAndUpdate(
        { owner: session.user.id },
        {
            $set: {
                name: body.name, // Name is required, so body.name MUST be present for upsert
                description: body.description,
                logo: body.logo,
                banner: body.banner,
                // Allow visibility toggle
                ...(typeof body.isActive === 'boolean' && { isActive: body.isActive }),
                ...(typeof body.isVisibleToCustomers === 'boolean' && { isVisibleToCustomers: body.isVisibleToCustomers }),
            },
            $setOnInsert: {
                ratingAvg: 0,
                ratingCount: 0
            }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(shop);
}
