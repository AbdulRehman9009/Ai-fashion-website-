import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Delivery from "@/models/Delivery";
import { logger } from "@/lib/logger";

export async function PATCH(req, { params }) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { action } = body;

        await connectDB();
        let order = await Order.findById(id);
        let delivery = null;

        // Delivery dashboards pass a Delivery document id; tailor/admin actions pass an Order id.
        if (!order) {
            delivery = await Delivery.findById(id);
            if (delivery) {
                order = await Order.findById(delivery.order);
            }
        } else if (order.delivery) {
            delivery = await Delivery.findById(order.delivery);
        }

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
                // Logic: Status -> out for pickup
                if (role !== "DELIVERY") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
                if (!delivery || String(delivery.assignedTo) !== String(userId)) {
                    return NextResponse.json({ error: "Not assigned to this delivery" }, { status: 403 });
                }

                newStatus = "OutForPickup";
                delivery.status = "OutForPickup";
                delivery.events.push({
                    at: new Date(),
                    status: "OutForPickup",
                    note: "Courier is heading to pickup"
                });
                break;

            case "confirm_delivery":
                // Logic: Status -> delivered
                if (role !== "DELIVERY") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
                if (!delivery || String(delivery.assignedTo) !== String(userId)) {
                    return NextResponse.json({ error: "Not assigned to this delivery" }, { status: 403 });
                }

                newStatus = "Delivered";
                order.paymentStatus = "PAID";
                delivery.status = "Delivered";
                delivery.confirmedAt = new Date();
                delivery.events.push({
                    at: delivery.confirmedAt,
                    status: "Delivered",
                    note: "Delivery confirmed"
                });
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
        if (delivery) {
            await delivery.save();
        }

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
