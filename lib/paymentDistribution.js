import stripe, { createTransfer } from "./stripe";
import { connectDB } from "./db";
import Earning from "@/models/Earning";
import Order from "@/models/Order";
import User from "@/models/User";
import Shop from "@/models/Shop";
import SystemConfig from "@/models/SystemConfig";

/**
 * Get payment distribution configuration
 * @returns {Promise<Object>} Distribution percentages
 */
export async function getPaymentConfig() {
    await connectDB();

    const config = await SystemConfig.findOne({ key: "payment_distribution" });

    if (config && config.value) {
        return config.value;
    }

    // Default configuration
    return {
        shopkeeperPercentage: 60,
        tailorPercentage: 25,
        deliveryPercentage: 10,
        platformFeePercentage: 5,
    };
}

/**
 * Update payment distribution configuration (Admin only)
 * @param {Object} newConfig - New configuration
 * @returns {Promise<Object>}
 */
export async function updatePaymentConfig(newConfig) {
    await connectDB();

    // Validate percentages add up to 100
    const total =
        (newConfig.shopkeeperPercentage || 0) +
        (newConfig.tailorPercentage || 0) +
        (newConfig.deliveryPercentage || 0) +
        (newConfig.platformFeePercentage || 0);

    if (Math.abs(total - 100) > 0.01) {
        return {
            success: false,
            error: `Percentages must add up to 100. Current total: ${total}`,
        };
    }

    const config = await SystemConfig.findOneAndUpdate(
        { key: "payment_distribution" },
        {
            key: "payment_distribution",
            value: newConfig,
            description: "Payment distribution percentages",
            category: "payments",
        },
        { upsert: true, new: true }
    );

    return { success: true, config };
}

/**
 * Calculate payment distribution for an order
 * @param {number} grandTotal - Order grand total in dollars
 * @param {Object} config - Optional config override
 * @returns {Object} Distribution breakdown
 */
export async function calculateDistribution(grandTotal, config = null) {
    if (!config) {
        config = await getPaymentConfig();
    }

    const distribution = {
        shopkeeperAmount: (grandTotal * config.shopkeeperPercentage) / 100,
        tailorAmount: (grandTotal * config.tailorPercentage) / 100,
        deliveryAmount: (grandTotal * config.deliveryPercentage) / 100,
        platformFee: (grandTotal * config.platformFeePercentage) / 100,
    };

    return distribution;
}

/**
 * Release payments to all parties after order delivery
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>}
 */
export async function releasePayments(orderId) {
    await connectDB();

    try {
        const order = await Order.findById(orderId)
            .populate("shop")
            .populate("assignedTailor")
            .populate("delivery");

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        // Check if order is delivered
        if (order.status !== "Delivered" && order.status !== "Completed") {
            return { success: false, error: "Order must be delivered before releasing payments" };
        }

        // Check if payment is confirmed
        if (order.paymentStatus !== "PAID") {
            return { success: false, error: "Payment not confirmed" };
        }

        const results = {
            shopkeeper: null,
            tailor: null,
            delivery: null,
        };

        // Transfer to shopkeeper
        if (order.shop?.stripeAccountId && order.paymentDistribution.shopkeeperAmount > 0) {
            const shopTransfer = await createTransfer({
                amount: order.paymentDistribution.shopkeeperAmount,
                destination: order.shop.stripeAccountId,
                metadata: {
                    orderId: order._id.toString(),
                    type: "shopkeeper_payment",
                },
            });

            if (shopTransfer.success) {
                await Order.findByIdAndUpdate(orderId, {
                    "paymentReleaseStatus.shopkeeper": "transferred",
                    "stripeTransferIds.shopkeeper": shopTransfer.transfer.id,
                });

                await Earning.create({
                    user: order.shop.owner,
                    order: order._id,
                    amount: order.paymentDistribution.shopkeeperAmount,
                    type: "product_sale",
                    status: "paid",
                    stripeTransferId: shopTransfer.transfer.id,
                    paidAt: new Date(),
                });

                results.shopkeeper = { success: true, transferId: shopTransfer.transfer.id };
            } else {
                await Order.findByIdAndUpdate(orderId, {
                    "paymentReleaseStatus.shopkeeper": "failed",
                });

                await Earning.create({
                    user: order.shop.owner,
                    order: order._id,
                    amount: order.paymentDistribution.shopkeeperAmount,
                    type: "product_sale",
                    status: "failed",
                    failureReason: shopTransfer.error,
                });

                results.shopkeeper = { success: false, error: shopTransfer.error };
            }
        }

        // Transfer to tailor
        if (order.assignedTailor?.stripeAccountId && order.paymentDistribution.tailorAmount > 0) {
            const tailorTransfer = await createTransfer({
                amount: order.paymentDistribution.tailorAmount,
                destination: order.assignedTailor.stripeAccountId,
                metadata: {
                    orderId: order._id.toString(),
                    type: "tailor_payment",
                },
            });

            if (tailorTransfer.success) {
                await Order.findByIdAndUpdate(orderId, {
                    "paymentReleaseStatus.tailor": "transferred",
                    "stripeTransferIds.tailor": tailorTransfer.transfer.id,
                });

                await Earning.create({
                    user: order.assignedTailor._id,
                    order: order._id,
                    amount: order.paymentDistribution.tailorAmount,
                    type: "tailoring",
                    status: "paid",
                    stripeTransferId: tailorTransfer.transfer.id,
                    paidAt: new Date(),
                });

                results.tailor = { success: true, transferId: tailorTransfer.transfer.id };
            } else {
                await Order.findByIdAndUpdate(orderId, {
                    "paymentReleaseStatus.tailor": "failed",
                });

                await Earning.create({
                    user: order.assignedTailor._id,
                    order: order._id,
                    amount: order.paymentDistribution.tailorAmount,
                    type: "tailoring",
                    status: "failed",
                    failureReason: tailorTransfer.error,
                });

                results.tailor = { success: false, error: tailorTransfer.error };
            }
        }

        // Transfer to delivery person
        if (order.delivery?.userId?.stripeAccountId && order.paymentDistribution.deliveryAmount > 0) {
            const deliveryUser = await User.findById(order.delivery.userId);
            const deliveryTransfer = await createTransfer({
                amount: order.paymentDistribution.deliveryAmount,
                destination: deliveryUser.stripeAccountId,
                metadata: {
                    orderId: order._id.toString(),
                    type: "delivery_payment",
                },
            });

            if (deliveryTransfer.success) {
                await Order.findByIdAndUpdate(orderId, {
                    "paymentReleaseStatus.delivery": "transferred",
                    "stripeTransferIds.delivery": deliveryTransfer.transfer.id,
                });

                await Earning.create({
                    user: deliveryUser._id,
                    order: order._id,
                    amount: order.paymentDistribution.deliveryAmount,
                    type: "delivery",
                    status: "paid",
                    stripeTransferId: deliveryTransfer.transfer.id,
                    paidAt: new Date(),
                });

                results.delivery = { success: true, transferId: deliveryTransfer.transfer.id };
            } else {
                await Order.findByIdAndUpdate(orderId, {
                    "paymentReleaseStatus.delivery": "failed",
                });

                await Earning.create({
                    user: deliveryUser._id,
                    order: order._id,
                    amount: order.paymentDistribution.deliveryAmount,
                    type: "delivery",
                    status: "failed",
                    failureReason: deliveryTransfer.error,
                });

                results.delivery = { success: false, error: deliveryTransfer.error };
            }
        }

        // Record platform fee
        await Earning.create({
            user: null, // Platform earning
            order: order._id,
            amount: order.paymentDistribution.platformFee,
            type: "platform_fee",
            status: "paid",
            paidAt: new Date(),
        });

        return { success: true, results };
    } catch (error) {
        console.error("Error releasing payments:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Retry a failed transfer
 * @param {string} earningId - Earning document ID
 * @returns {Promise<Object>}
 */
export async function retryFailedTransfer(earningId) {
    await connectDB();

    try {
        const earning = await Earning.findById(earningId).populate("user order");

        if (!earning) {
            return { success: false, error: "Earning record not found" };
        }

        if (earning.status !== "failed") {
            return { success: false, error: "Earning is not in failed status" };
        }

        // Check retry count (max 3 retries)
        if (earning.retryCount >= 3) {
            return { success: false, error: "Maximum retry attempts reached" };
        }

        // Get destination Stripe account
        let destination = null;
        if (earning.type === "product_sale") {
            const shop = await Shop.findOne({ owner: earning.user._id });
            destination = shop?.stripeAccountId;
        } else {
            destination = earning.user?.stripeAccountId;
        }

        if (!destination) {
            return { success: false, error: "No Stripe account found for user" };
        }

        // Attempt transfer
        const transfer = await createTransfer({
            amount: earning.amount,
            destination,
            metadata: {
                orderId: earning.order._id.toString(),
                type: earning.type,
                retryAttempt: earning.retryCount + 1,
            },
        });

        if (transfer.success) {
            await Earning.findByIdAndUpdate(earningId, {
                status: "paid",
                stripeTransferId: transfer.transfer.id,
                paidAt: new Date(),
                retryCount: earning.retryCount + 1,
            });

            // Update order payment release status
            const updateField = earning.type === "product_sale" ? "shopkeeper" : earning.type === "tailoring" ? "tailor" : "delivery";
            await Order.findByIdAndUpdate(earning.order._id, {
                [`paymentReleaseStatus.${updateField}`]: "transferred",
                [`stripeTransferIds.${updateField}`]: transfer.transfer.id,
            });

            return { success: true, transferId: transfer.transfer.id };
        } else {
            await Earning.findByIdAndUpdate(earningId, {
                retryCount: earning.retryCount + 1,
                failureReason: transfer.error,
            });

            return { success: false, error: transfer.error };
        }
    } catch (error) {
        console.error("Error retrying transfer:", error);
        return { success: false, error: error.message };
    }
}
