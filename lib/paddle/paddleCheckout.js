import { paddleClient } from './paddleClient';

/**
 * Create a Paddle checkout session for an order using INLINE pricing.
 * This does NOT require products to have pre-synced paddlePriceId.
 * Paddle creates the price at transaction time from the order total.
 *
 * @param {Object} options - Checkout options
 * @param {string} options.orderId - Order ID
 * @param {string} options.orderName - Display name for the order
 * @param {string} options.orderDescription - Description for the checkout
 * @param {number} options.totalAmount - Total amount in dollars (will be converted to cents)
 * @param {string} options.currency - Currency code (default: USD)
 * @param {string} options.customerEmail - Customer email
 * @param {string} options.successUrl - Success redirect URL
 * @param {string} options.cancelUrl - Cancel redirect URL
 */
export async function createCheckoutSession({
    orderId,
    orderName,
    orderDescription,
    totalAmount,
    currency = "USD",
    customerEmail,
    successUrl,
    cancelUrl
}) {
    if (!paddleClient) {
        console.warn("Paddle client not initialized - checkout unavailable");
        return { success: false, error: "Paddle not configured", url: null };
    }

    if (!totalAmount || totalAmount <= 0) {
        console.warn("Invalid total amount for checkout");
        return { success: false, error: "Invalid amount", url: null };
    }

    try {
        // Use inline pricing — no need for pre-created paddlePriceId
        const transaction = await paddleClient.transactions.create({
            items: [
                {
                    price: {
                        product: {
                            name: orderName || `Order #${orderId?.slice(-6) || "000000"}`,
                            description: orderDescription || "Fashion order",
                            tax_category: "standard"
                        },
                        unit_price: {
                            amount: Math.round(totalAmount * 100).toString(),
                            currency_code: currency
                        },
                        billing_cycle: null,
                        quantity: { minimum: 1, maximum: 1 }
                    },
                    quantity: 1
                }
            ],
            custom_data: {
                order_id: orderId
            },
            checkout: {
                url: successUrl || process.env.NEXTAUTH_URL
            }
        });

        if (!transaction || !transaction.checkout || !transaction.checkout.url) {
            console.warn("Transaction created but no checkout URL returned");
            return {
                success: true,
                id: transaction?.id,
                url: null
            };
        }

        return {
            success: true,
            id: transaction.id,
            url: transaction.checkout.url
        };
    } catch (error) {
        console.error("Error creating Paddle checkout:", error);
        return { success: false, error: error.message, url: null };
    }
}

/**
 * Get checkout session details
 */
export async function getCheckoutSession(checkoutId) {
    try {
        const checkout = await paddleClient.checkouts.get(checkoutId);
        return { success: true, checkout };
    } catch (error) {
        console.error("Error getting checkout session:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a refund for a transaction
 */
export async function createRefund(transactionId, amount = null, reason = "customer_request") {
    try {
        const refund = await paddleClient.refunds.create({
            transaction_id: transactionId,
            reason,
            ...(amount && { amount: Math.round(amount * 100).toString() })
        });
        return { success: true, refund };
    } catch (error) {
        console.error("Error creating refund:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get transaction details
 */
export async function getTransaction(transactionId) {
    try {
        const transaction = await paddleClient.transactions.get(transactionId);
        return { success: true, transaction };
    } catch (error) {
        console.error("Error getting transaction:", error);
        return { success: false, error: error.message };
    }
}
