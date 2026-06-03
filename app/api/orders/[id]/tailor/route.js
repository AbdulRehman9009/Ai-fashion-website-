import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Shop from "@/models/Shop";

export async function PATCH(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Order ID
    const body = await req.json();

    await connectDB();

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (session.user.role === "SHOPKEEPER") {
        // Validate ownership
        const shop = await Shop.findOne({ owner: session.user.id });
        if (!shop || String(order.shop) !== String(shop._id)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { tailorId } = body;
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

    } else if (session.user.role === "TAILOR") {
        // Validate that this tailor is assigned to the order
        if (String(order.assignedTailor) !== String(session.user.id)) {
            return NextResponse.json({ error: "Forbidden: Order not assigned to you" }, { status: 403 });
        }

        const { action } = body;

        if (action === "accept") {
            order.tailorAcceptanceStatus = "Accepted";
            order.status = "TailoringInProgress";
            order.timeline.push({
                at: new Date(),
                byRole: "TAILOR",
                event: "TailoringAccepted",
                notes: "Tailor accepted the assignment"
            });
        } else if (action === "reject") {
            order.tailorAcceptanceStatus = "Rejected";
            order.assignedTailor = null;
            order.status = "PaymentConfirmed"; // Back to state where shopkeeper can reassign
            order.timeline.push({
                at: new Date(),
                byRole: "TAILOR",
                event: "TailoringRejected",
                notes: "Tailor rejected the assignment"
            });
        } else if (action === "start_stitching") {
            order.status = "TailoringInProgress";
            order.timeline.push({
                at: new Date(),
                byRole: "TAILOR",
                event: "TailoringStarted",
                notes: "Tailor started stitching"
            });
        } else if (action === "complete") {
            order.status = "TailoringCompleted";
            order.timeline.push({
                at: new Date(),
                byRole: "TAILOR",
                event: "TailoringCompleted",
                notes: "Tailoring completed"
            });
        } else if (action === "update_date") {
            if (body.date) {
                order.estimatedCompletionDate = new Date(body.date);
            }
        } else if (action === "update_notes") {
            order.tailorNotes = body.notes;
        } else {
            return NextResponse.json({ error: "Invalid tailor action" }, { status: 400 });
        }

        await order.save();
        return NextResponse.json({ message: `Action ${action} succeeded` });

    } else {
        return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }
}
