import { paddleClient } from './paddleClient';

/**
 * Create a Paddle checkout session for an order
 */
export async function createCheckoutSession(orderId, items, customerEmail, successUrl, cancelUrl) {
    try {
        const checkoutItems = items.map(item => ({
            price_id: item.paddlePriceId,
            quantity: item.quantity || 1
        }));

        const checkout = await paddleClient.checkouts.create({
            items: checkoutItems,
            customer_email: customerEmail,
            custom_data: {
                order_id: orderId
            },
            return_url: successUrl,
            discount_url: cancelUrl
        });

        return {
            success: true,
            checkoutId: checkout.id,
            checkoutUrl: checkout.checkout_url
        };
    } catch (error) {
        console.error("Error creating Paddle checkout:", error);
        return { success: false, error: error.message };
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
