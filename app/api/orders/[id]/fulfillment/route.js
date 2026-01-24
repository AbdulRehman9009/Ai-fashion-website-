import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { logger } from "@/lib/logger";

export async function PATCH(req, { params }) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params;
        const body = await req.json();
        const { action } = body;

        await connectDB();
        const order = await Order.findById(id);

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // Handle Actions based on Role and requested Action
        const userId = token.sub;
        const role = token.role;
        let newStatus = null;
        let updateData = {};

        switch (action) {
            case "accept_job":
                // Logic: Assign Tailor
                if (role !== "TAILOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
                if (order.tailorAcceptanceStatus === "Accepted") return NextResponse.json({ error: "Already accepted" }, { status: 400 });

                updateData = {
                    assignedTailor: userId,
                    tailorAcceptanceStatus: "Accepted",
                    status: "TailoringInProgress" // Auto-move to progress? Or keep Pending? User said "Assigns current user as tailor."
                };
                // If system requires explicit move to "InProgress", we can do it here or let user do it separately.
                // Assuming accepting STARTS the job interaction.
                break;

            case "mark_stitched":
                // Logic: Status -> stitched (TailoringCompleted)
                if (role !== "TAILOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
                // Verify assignment
                if (String(order.assignedTailor) !== String(userId)) return NextResponse.json({ error: "Not assigned to this job" }, { status: 403 });

                newStatus = "TailoringCompleted";
                // Also user used term "stitched" - system maps to TailoringCompleted
                break;

            case "pickup":
                // Logic: Status -> out_for_delivery
                if (role !== "DELIVERY") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
                // Could verify assignment if delivery assignment exists

                newStatus = "OutForDelivery"; // Skipping "PickedUp" intermediate if user wants direct "out_for_delivery"
                break;

            case "confirm_delivery":
                // Logic: Status -> delivered
                if (role !== "DELIVERY") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

                newStatus = "Delivered";
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Apply updates
        if (newStatus) {
            order.status = newStatus;
            order.timeline.push({
                at: new Date(),
                byRole: role,
                event: newStatus,
                notes: `Action: ${action}`
            });
        }

        if (Object.keys(updateData).length > 0) {
            Object.assign(order, updateData);
            order.timeline.push({
                at: new Date(),
                byRole: role,
                event: action,
                notes: "Metadata update"
            });
        }

        await order.save();

        // Log
        logger.info(`Order ${id} updated via fulfillment action: ${action}`, { userId, role });

        return NextResponse.json({
            success: true,
            orderId: order._id,
            status: order.status
        });

    } catch (error) {
        console.error("Fulfillment API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
