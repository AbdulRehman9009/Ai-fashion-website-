import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Payout from "@/models/Payout";
import User from "@/models/User";

/**
 * Generate payout records when an order is completed
 * Called when order status transitions to "Completed"
 * 
 * @param {string} orderId - The order ID
 * @returns {Object} - Result with created payouts
 */
export async function generatePayoutsForOrder(orderId) {
    await connectDB();

    const order = await Order.findById(orderId)
        .populate("shop")
        .populate("assignedTailor")
        .lean();

    if (!order) {
        throw new Error(`Order not found: ${orderId}`);
    }

    // Check if payouts already exist (idempotency)
    const existingPayouts = await Payout.find({ orderId }).lean();
    if (existingPayouts.length > 0) {
        console.log(`Payouts already exist for order ${orderId}`);
        return { skipped: true, existing: existingPayouts.length };
    }

    const payouts = [];

    // 1. Shopkeeper payout (product sales)
    if (order.shop?.owner && order.pricing.itemsTotal > 0) {
        payouts.push({
            userId: order.shop.owner,
            orderId: order._id,
            amount: Math.round(order.pricing.itemsTotal * 100), // Store in cents
            currency: order.pricing.currency || "USD",
            type: "product_sale",
            providerRole: "SHOPKEEPER",
            idempotencyKey: `${orderId}_shopkeeper_product`
        });
    }

    // 2. Tailor payout (tailoring fees)
    if (order.assignedTailor && order.pricing.tailoringTotal > 0) {
        payouts.push({
            userId: order.assignedTailor._id || order.assignedTailor,
            orderId: order._id,
            amount: Math.round(order.pricing.tailoringTotal * 100),
            currency: order.pricing.currency || "USD",
            type: "tailoring_fee",
            providerRole: "TAILOR",
            idempotencyKey: `${orderId}_tailor_fee`
        });
    }

    // 3. Delivery payout (delivery fees)
    if (order.delivery && order.pricing.deliveryFee > 0) {
        // Get delivery person's user ID
        const Delivery = (await import("@/models/Delivery")).default;
        const delivery = await Delivery.findById(order.delivery).lean();

        if (delivery?.assignedTo) {
            payouts.push({
                userId: delivery.assignedTo,
                orderId: order._id,
                amount: Math.round(order.pricing.deliveryFee * 100),
                currency: order.pricing.currency || "USD",
                type: "delivery_fee",
                providerRole: "DELIVERY",
                idempotencyKey: `${orderId}_delivery_fee`
            });
        }
    }

    // 4. Platform fee (Admin keeps this)
    if (order.pricing.serviceFee > 0) {
        // Find admin user or use system account
        const adminUser = await User.findOne({ role: "ADMIN" }).lean();
        if (adminUser) {
            payouts.push({
                userId: adminUser._id,
                orderId: order._id,
                amount: Math.round(order.pricing.serviceFee * 100),
                currency: order.pricing.currency || "USD",
                type: "platform_fee",
                providerRole: "ADMIN",
                status: "paid_by_admin", // Platform fee is auto-retained
                paidAt: new Date(),
                idempotencyKey: `${orderId}_platform_fee`
            });
        }
    }

    // Create all payouts
    if (payouts.length > 0) {
        try {
            const created = await Payout.insertMany(payouts, { ordered: false });
            console.log(`Created ${created.length} payouts for order ${orderId}`);
            return { success: true, created: created.length };
        } catch (error) {
            // Handle duplicate key errors gracefully
            if (error.code === 11000) {
                console.log(`Some payouts already existed for order ${orderId}`);
                return { partial: true, error: "Some payouts already existed" };
            }
            throw error;
        }
    }

    return { success: true, created: 0 };
}

/**
 * Get pending payouts summary for admin dashboard
 */
export async function getPendingPayoutsSummary() {
    await connectDB();

    const summary = await Payout.aggregate([
        { $match: { status: "pending" } },
        {
            $group: {
                _id: "$providerRole",
                totalAmount: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        }
    ]);

    const totalPending = summary.reduce((acc, item) => acc + item.totalAmount, 0);

    return {
        byRole: summary.reduce((acc, item) => {
            acc[item._id] = {
                amount: item.totalAmount / 100, // Convert back to dollars
                count: item.count
            };
            return acc;
        }, {}),
        total: totalPending / 100
    };
}

/**
 * Mark a payout as paid by admin
 */
export async function markPayoutAsPaid(payoutId, adminUserId, notes = "") {
    await connectDB();

    const payout = await Payout.findByIdAndUpdate(
        payoutId,
        {
            status: "paid_by_admin",
            paidAt: new Date(),
            paidBy: adminUserId,
            notes
        },
        { new: true }
    ).populate("userId", "name email");

    return payout;
}
