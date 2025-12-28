import Earning from "@/models/Earning";
import User from "@/models/User";
import Order from "@/models/Order";
import { getPaymentDistributionConfig, calculatePaymentDistribution } from "../payment-distribution";

/**
 * Mark earnings as available after successful payment
 */
export async function markEarningsAsAvailable(orderId) {
    try {
        await Earning.updateMany(
            { order: orderId, status: "pending" },
            { status: "available" }
        );

        await Order.findByIdAndUpdate(orderId, {
            "paymentReleaseStatus.shopkeeper": "available",
            "paymentReleaseStatus.tailor": "available",
            "paymentReleaseStatus.delivery": "available",
        });

        return { success: true };
    } catch (error) {
        console.error("Error marking earnings as available:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Calculate and create earnings for all parties
 */
export async function createEarningsForOrder(order) {
    try {
        const config = await getPaymentDistributionConfig();
        const distribution = calculatePaymentDistribution(
            order.grandTotal,
            order.isUrgent,
            config
        );

        const earnings = [];

        // Shopkeeper earning
        if (distribution.shopkeeperAmount > 0 && order.shop) {
            const shopOwner = order.shop.owner || order.shop;
            earnings.push({
                user: shopOwner,
                order: order._id,
                amount: distribution.shopkeeperAmount,
                type: "product_sale",
                status: "pending",
            });
        }

        // Tailor earning
        if (distribution.tailorAmount > 0 && order.assignedTailor) {
            earnings.push({
                user: order.assignedTailor,
                order: order._id,
                amount: distribution.tailorAmount,
                type: "tailoring",
                status: "pending",
            });
        }

        // Delivery earning
        if (distribution.deliveryAmount > 0 && order.assignedDelivery) {
            earnings.push({
                user: order.assignedDelivery,
                order: order._id,
                amount: distribution.deliveryAmount,
                type: "delivery",
                status: "pending",
            });
        }

        // Platform fee
        if (distribution.platformFee > 0) {
            earnings.push({
                user: null,
                order: order._id,
                amount: distribution.platformFee,
                type: "platform_fee",
                status: "paid", // Platform fee is immediately available
                paidAt: new Date(),
            });
        }

        await Earning.insertMany(earnings);

        // Update order with distribution
        await Order.findByIdAndUpdate(order._id, {
            paymentDistribution: distribution,
        });

        return { success: true, earnings: earnings.length };
    } catch (error) {
        console.error("Error creating earnings:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Process a payout batch
 */
export async function processPayout Batch(userId, earningIds) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Verify all earnings belong to this user and are available
        const earnings = await Earning.find({
            _id: { $in: earningIds },
            user: userId,
            status: "available",
        });

        if (earnings.length !== earningIds.length) {
            return { success: false, error: "Some earnings are not available for payout" };
        }

        const totalAmount = earnings.reduce((sum, e) => sum + e.amount, 0);
        const batchId = `BATCH_${Date.now()}_${userId}`;

        // Update earnings to paid status
        await Earning.updateMany(
            { _id: { $in: earningIds } },
            {
                status: "paid",
                paidAt: new Date(),
                payoutBatchId: batchId,
                payoutMethod: user.payoutMethod?.type || "manual",
                payoutReference: `Manual payout - ${new Date().toISOString()}`,
            }
        );

        // Update order payment release status
        for (const earning of earnings) {
            const updateField = {};
            if (earning.type === "product_sale") {
                updateField["paymentReleaseStatus.shopkeeper"] = "paid";
            } else if (earning.type === "tailoring") {
                updateField["paymentReleaseStatus.tailor"] = "paid";
            } else if (earning.type === "delivery") {
                updateField["paymentReleaseStatus.delivery"] = "paid";
            }
            await Order.findByIdAndUpdate(earning.order, updateField);
        }

        return {
            success: true,
            batchId,
            totalAmount,
            earningsCount: earnings.length,
        };
    } catch (error) {
        console.error("Error processing payout batch:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get available earnings for a user
 */
export async function getAvailableEarnings(userId) {
    try {
        const earnings = await Earning.find({
            user: userId,
            status: "available",
        }).populate("order");

        const totalAmount = earnings.reduce((sum, e) => sum + e.amount, 0);

        return {
            success: true,
            earnings,
            totalAmount,
            count: earnings.length,
        };
    } catch (error) {
        console.error("Error getting available earnings:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get earnings summary for a user
 */
export async function getEarningsSummary(userId) {
    try {
        const [pending, available, paid] = await Promise.all([
            Earning.aggregate([
                { $match: { user: userId, status: "pending" } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
            Earning.aggregate([
                { $match: { user: userId, status: "available" } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
            Earning.aggregate([
                { $match: { user: userId, status: "paid" } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
        ]);

        return {
            success: true,
            summary: {
                pending: { amount: pending[0]?.total || 0, count: pending[0]?.count || 0 },
                available: { amount: available[0]?.total || 0, count: available[0]?.count || 0 },
                paid: { amount: paid[0]?.total || 0, count: paid[0]?.count || 0 },
                total: (pending[0]?.total || 0) + (available[0]?.total || 0) + (paid[0]?.total || 0),
            },
        };
    } catch (error) {
        console.error("Error getting earnings summary:", error);
        return { success: false, error: error.message };
    }
}
