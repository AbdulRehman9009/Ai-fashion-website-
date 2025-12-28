import SystemConfig from "@/models/SystemConfig";

/**
 * Get payment distribution configuration
 */
export async function getPaymentDistributionConfig() {
    try {
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
 * Calculate payment distribution for an order
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

    // Calculate amounts
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
