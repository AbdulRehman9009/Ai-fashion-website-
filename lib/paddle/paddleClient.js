import { Paddle } from '@paddle/paddle-node-sdk';

// Initialize Paddle client only if API key is available
let paddleClient = null;

try {
    if (process.env.PADDLE_API_KEY) {
        // NOTE: Paddle SDK expects the API key as-is (no Bearer prefix needed)
        // Make sure the PADDLE_API_KEY in .env starts with "live_" or "test_"
        const apiKey = process.env.PADDLE_API_KEY.trim();

        // Option 1: If you have a v2 API key (starts with live_ or test_)
        // The environment is auto-detected from the key prefix
        paddleClient = new Paddle(apiKey);

        console.log("Paddle client initialized successfully");
    } else {
        console.warn("PADDLE_API_KEY not found in environment variables");
    }
} catch (error) {
    console.error("Paddle client initialization failed:", error.message);
}

export { paddleClient };

/**
 * Create a Paddle product AND price for a shop item
 * This is the main function for product sync - creates both product and price in one call
 * 
 * @param {Object} options - Product options
 * @param {string} options.name - Product name
 * @param {string} options.description - Product description
 * @param {number} options.price - Price in dollars (will be converted to cents)
 * @param {string} options.currency - Currency code (default: USD)
 * @param {string} options.imageUrl - Optional product image URL
 * @returns {Object} - { success, productId, priceId, error }
 */
export async function createPaddleProduct({ name, description, price, currency = "USD", imageUrl = null }) {
    if (!paddleClient) {
        console.warn("Paddle client not initialized - skipping product sync");
        return { success: false, error: "Paddle not configured" };
    }

    try {
        // Step 1: Create the product in Paddle
        const product = await paddleClient.products.create({
            name: name || "Untitled Product",
            description: description || "",
            image_url: imageUrl,
            tax_category: 'standard'
        });

        console.log("Paddle product created:", product.id);

        // Step 2: Create a one-time price for this product
        const priceData = await paddleClient.prices.create({
            product_id: product.id,
            description: `${name} - One-time purchase`,
            unit_price: {
                amount: String(Math.round(price * 100)), // Convert to cents as string
                currency_code: currency
            },
            billing_cycle: null // One-time payment (not subscription)
        });

        console.log("Paddle price created:", priceData.id);

        return {
            success: true,
            productId: product.id,
            priceId: priceData.id
        };
    } catch (error) {
        console.error("Error creating Paddle product/price:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a Paddle price for an existing product
 */
export async function createPaddlePrice(productId, amount, currency = "USD") {
    if (!paddleClient) {
        return { success: false, error: "Paddle not configured" };
    }

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
    if (!paddleClient || !productId) {
        return { success: false, error: "Paddle not configured or missing product ID" };
    }

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
    if (!paddleClient || !productId) {
        return { success: false, error: "Paddle not configured or missing product ID" };
    }

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
    if (!paddleClient || !productId) {
        return { success: false, error: "Paddle not configured or missing product ID" };
    }

    try {
        const product = await paddleClient.products.archive(productId);
        return { success: true, product };
    } catch (error) {
        console.error("Error archiving Paddle product:", error);
        return { success: false, error: error.message };
    }
}
