/**
 * Validate cart for multi-shop conflicts
 * @param {Array} cart - Cart items array
 * @returns {Object} - { valid: boolean, error: string | null, shopId: string | null }
 */
export function validateCart(cart) {
    if (!cart || cart.length === 0) {
        return { valid: true, error: null, shopId: null };
    }

    // Extract shop IDs from cart items
    const shopIds = cart.map(item => item.product?.shop?._id || item.product?.shop).filter(Boolean);

    if (shopIds.length === 0) {
        return { valid: true, error: null, shopId: null };
    }

    // Check if all items are from the same shop
    const firstShopId = shopIds[0].toString();
    const hasMixedShops = shopIds.some(id => id.toString() !== firstShopId);

    if (hasMixedShops) {
        return {
            valid: false,
            error: "Your cart contains items from multiple shops. Please checkout one shop at a time.",
            shopId: null
        };
    }

    return {
        valid: true,
        error: null,
        shopId: firstShopId
    };
}

/**
 * Get unique shop ID from cart
 * @param {Array} cart - Cart items array
 * @returns {string | null} - Shop ID or null
 */
export function getCartShopId(cart) {
    if (!cart || cart.length === 0) return null;
    return cart[0]?.product?.shop?._id || cart[0]?.product?.shop || null;
}
