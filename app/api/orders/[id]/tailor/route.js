import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Shop from "@/models/Shop";

export async function PATCH(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SHOPKEEPER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Order ID
    const { tailorId } = await req.json();

    await connectDB();

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Validate ownership
    const shop = await Shop.findOne({ owner: session.user.id });
    if (String(order.shop) !== String(shop._id)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    order.assignedTailor = tailorId;
    order.status = "TailoringPending"; // Move to next stage
    order.tailorAcceptanceStatus = "Pending";

    // Add to timeline
    order.timeline.push({
        at: new Date(),
        byRole: "SHOPKEEPER",
        event: "TailorAssigned",
        notes: `Assigned to Tailor ID: ${tailorId}`
    });

    await order.save();

    return NextResponse.json({ message: "Tailor assigned" });
}
