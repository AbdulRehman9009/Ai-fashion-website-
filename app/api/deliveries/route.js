import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Delivery from "@/models/Delivery";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req) {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "DELIVERY") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Fetch deliveries assigned to this delivery person
        const deliveries = await Delivery.find({ assignedTo: token.sub })
            .populate({
                path: "order",
                populate: [
                    { path: "user", select: "name email image" },
                    { path: "shop", select: "name logo" },
                    {
                        path: "items.product",
                        select: "name imageUrl"
                    }
                ]
            })
            .sort({ createdAt: -1 })
            .lean();

        // Enrich deliveries with calculated fields
        const enrichedDeliveries = deliveries.map(delivery => {
            const order = delivery.order;
            return {
                ...delivery,
                customer: order?.user,
                shop: order?.shop,
                outfitImage: order?.items?.[0]?.product?.imageUrl,
                deliveryAddress: order?.shippingAddress,
                urgent: order?.urgent || false,
                orderStatus: order?.status,
                paymentStatus: order?.paymentStatus,
                eventType: order?.eventType || "General",
                orderId: order?._id,
            };
        });

        return NextResponse.json(enrichedDeliveries);
    } catch (error) {
        console.error("Error fetching deliveries:", error);
        return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 });
    }
}
