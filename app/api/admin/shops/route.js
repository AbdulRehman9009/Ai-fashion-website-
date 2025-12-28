import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Shop from "@/models/Shop";
import Product from "@/models/Product";
import Order from "@/models/Order";
import AuditLog from "@/models/AuditLog";

// GET /api/admin/shops - List all shops with stats
export async function GET(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const shops = await Shop.find()
            .populate("owner", "name email")
            .sort({ createdAt: -1 })
            .lean();

        // Get stats for each shop
        const shopsWithStats = await Promise.all(
            shops.map(async (shop) => {
                const productCount = await Product.countDocuments({ shop: shop._id });
                const orders = await Order.find({ shop: shop._id }).lean();
                const orderCount = orders.length;
                const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.grandTotal || 0), 0);

                return {
                    ...shop,
                    productCount,
                    orderCount,
                    totalRevenue
                };
            })
        );

        return NextResponse.json(shopsWithStats);
    } catch (error) {
        console.error("Error fetching shops:", error);
        return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
    }
}

// PATCH /api/admin/shops - Update shop visibility/status
export async function PATCH(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { shopId, isActive, isVisibleToCustomers } = body;

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        const updates = {};
        if (isActive !== undefined) updates.isActive = isActive;
        if (isVisibleToCustomers !== undefined) updates.isVisibleToCustomers = isVisibleToCustomers;

        const updatedShop = await Shop.findByIdAndUpdate(shopId, updates, { new: true });

        // Log action
        await AuditLog.create({
            admin: token.sub,
            action: isActive === false ? "SHOP_DEACTIVATED" :
                isVisibleToCustomers === false ? "SHOP_HIDDEN" : "SHOP_UPDATED",
            targetType: "SHOP",
            targetId: shop._id,
            targetEmail: shop.owner?.email || "",
            details: { updates }
        });

        return NextResponse.json(updatedShop);
    } catch (error) {
        console.error("Error updating shop:", error);
        return NextResponse.json({ error: "Failed to update shop" }, { status: 500 });
    }
}
