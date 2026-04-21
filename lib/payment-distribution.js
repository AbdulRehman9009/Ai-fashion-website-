import { connectDB } from "./db";
import SystemConfig from "@/models/SystemConfig";

/**
 * Get payment distribution configuration from DB or use defaults.
 * This is the SINGLE SOURCE OF TRUTH for payment splits.
 */
export async function getPaymentDistributionConfig() {
    try {
        await connectDB();
        const config = await SystemConfig.findOne({ key: "payment_distribution" }).lean();

        if (config && config.value) {
            return config.value;
        }

        // Default configuration
        return {
            shopkeeperPercentage: 70,
            tailorPercentage: 20,
            deliveryBaseFee: 10,
            deliveryUrgentBonus: 5,
            platformFeePercentage: 10,
        };
    } catch (error) {
        console.error("Error fetching payment distribution config:", error);
        // Return defaults on error
        return {
            shopkeeperPercentage: 70,
            tailorPercentage: 20,
            deliveryBaseFee: 10,
            deliveryUrgentBonus: 5,
            platformFeePercentage: 10,
        };
    }
}

/**
 * Calculate payment distribution for an order.
 *
 * @param {number} grandTotal - Order grand total in dollars
 * @param {boolean} isUrgent - Whether the order is urgent
 * @param {Object|null} config - Optional config override
 * @returns {Object} Distribution breakdown
 */
export function calculatePaymentDistribution(grandTotal, isUrgent = false, config = null) {
    const distributionConfig = config || {
        shopkeeperPercentage: 70,
        tailorPercentage: 20,
        deliveryBaseFee: 10,
        deliveryUrgentBonus: 5,
        platformFeePercentage: 10,
    };

    const deliveryFee = distributionConfig.deliveryBaseFee + (isUrgent ? distributionConfig.deliveryUrgentBonus : 0);

    // Calculate amounts from the remainder after delivery fee
    const itemsAndTailoringTotal = grandTotal - deliveryFee;
    const shopkeeperAmount = (itemsAndTailoringTotal * distributionConfig.shopkeeperPercentage) / 100;
    const tailorAmount = (itemsAndTailoringTotal * distributionConfig.tailorPercentage) / 100;
    const deliveryAmount = deliveryFee;
    const platformFee = (itemsAndTailoringTotal * distributionConfig.platformFeePercentage) / 100;

    return {
        shopkeeperAmount: parseFloat(shopkeeperAmount.toFixed(2)),
        tailorAmount: parseFloat(tailorAmount.toFixed(2)),
        deliveryAmount: parseFloat(deliveryAmount.toFixed(2)),
        platformFee: parseFloat(platformFee.toFixed(2)),
        processingFee: 0, // Paddle handles processing fees
    };
}

/**
 * Update payment distribution configuration (Admin only).
 * Validates that percentages sum to 100.
 *
 * @param {Object} newConfig - New configuration
 * @returns {Promise<Object>}
 */
export async function updatePaymentConfig(newConfig) {
    await connectDB();

    // Validate percentages add up to 100
    const total =
        (newConfig.shopkeeperPercentage || 0) +
        (newConfig.tailorPercentage || 0) +
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
 * Get payment distribution configuration (alias for admin route).
 */
export async function getPaymentConfig() {
    return getPaymentDistributionConfig();
}
