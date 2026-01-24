import { paddleClient } from './paddleClient';

/**
 * Create a Paddle checkout session for an order
 * @param {Object} options - Checkout options
 * @param {string} options.orderId - Order ID
 * @param {Array} options.items - Array of items with paddlePriceId and quantity
 * @param {string} options.customerEmail - Customer email
 * @param {string} options.successUrl - Success redirect URL
 * @param {string} options.cancelUrl - Cancel redirect URL
 */
export async function createCheckoutSession({ orderId, items, customerEmail, successUrl, cancelUrl }) {
    try {
        // Filter out items without valid Paddle price IDs
        const validItems = items.filter(item => item.paddlePriceId);

        if (validItems.length === 0) {
            console.warn("No items with valid Paddle price IDs");
            return {
                success: false,
                error: "Products not configured for payment. Please contact support.",
                url: null
            };
        }

        const checkoutItems = validItems.map(item => ({
            price_id: item.paddlePriceId,
            quantity: item.quantity || 1
        }));

        const checkout = await paddleClient.checkouts.create({
            items: checkoutItems,
            customer_email: customerEmail,
            custom_data: {
                order_id: orderId
            },
            return_url: successUrl || `${process.env.NEXTAUTH_URL}/dashboard/user/orders?success=true`,
            discount_url: cancelUrl
        });

        return {
            success: true,
            id: checkout.id,
            url: checkout.checkout_url
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
