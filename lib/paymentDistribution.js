import { connectDB } from "./db";
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
