import { Paddle } from '@paddle/paddle-node-sdk';

if (!process.env.PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY is not set in environment variables");
}

// Initialize Paddle client
export const paddleClient = new

    Paddle(process.env.PADDLE_API_KEY, {
        environment: process.env.PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
    });

/**
 * Create a Paddle product for a shop item
 */
export async function createPaddleProduct(name, description, imageUrl = null) {
    try {
        const product = await paddleClient.products.create({
            name,
            description,
            image_url: imageUrl,
            tax_category: 'standard'
        });
        return { success: true, product };
    } catch (error) {
        console.error("Error creating Paddle product:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a Paddle price for a product
 */
export async function createPaddlePrice(productId, amount, currency = "USD") {
    try {
        const price = await paddleClient.prices.create({
            product_id: productId,
            unit_price: {
                amount: Math.round(amount * 100).toString(), // Convert to cents as string
                currency_code: currency
            },
            billing_cycle: null // One-time payment
        });
        return { success: true, price };
    } catch (error) {
        console.error("Error creating Paddle price:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update a Paddle product
 */
export async function updatePaddleProduct(productId, updates) {
    try {
        const product = await paddleClient.products.update(productId, updates);
        return { success: true, product };
    } catch (error) {
        console.error("Error updating Paddle product:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get a Paddle product
 */
export async function getPaddleProduct(productId) {
    try {
        const product = await paddleClient.products.get(productId);
        return { success: true, product };
    } catch (error) {
        console.error("Error getting Paddle product:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Archive a Paddle product
 */
export async function archivePaddleProduct(productId) {
    try {
        const product = await paddleClient.products.archive(productId);
        return { success: true, product };
    } catch (error) {
        console.error("Error archiving Paddle product:", error);
        return { success: false, error: error.message };
    }
}
