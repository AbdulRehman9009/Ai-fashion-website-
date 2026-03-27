/**
 * Pricing and Payment Distribution Module
 * Handles order pricing and revenue split between parties
 */

// Platform commission rates (configurable by admin)
const PLATFORM_RATES = {
  platformFee: 0.10,      // 10% platform commission
  shopkeeperShare: 0.70,  // 70% to shopkeeper
  tailorShare: 0.15,      // 15% to tailor (if applicable)
  deliveryShare: 0.05,    // 5% to delivery partner
};


export function computePricing({
  items,
  tailoringRequests = [],
  urgent = false,
  deliveryZone = "standard",
  taxRate = 0.10,
  currency = "USD"
}) {
  const itemsTotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const tailoringTotal = tailoringRequests.reduce((sum, t) => sum + (t.price || 0), 0);
  const baseDelivery = deliveryZone === "express" ? 15 : 8;
  const deliveryFee = baseDelivery + Math.min(20, itemsTotal * 0.02);
  const urgentFee = urgent ? Math.round((itemsTotal + tailoringTotal) * 0.15) : 0;
  const serviceFee = Math.round((itemsTotal + tailoringTotal) * 0.03);
  const taxable = itemsTotal + tailoringTotal;
  const tax = Math.round(taxable * taxRate);
  const discount = 0;
  const grandTotal = itemsTotal + tailoringTotal + deliveryFee + tax + serviceFee + urgentFee - discount;

  return {
    itemsTotal,
    tailoringTotal,
    deliveryFee,
    tax,
    discount,
    serviceFee,
    urgentFee,
    grandTotal,
    currency
  };
}

/**
 * Calculate payment distribution for all parties
 * @param {object} order - Order with pricing details
 * @returns {object} - Distribution amounts for each party
 */
export function calculatePaymentDistribution(order) {
  const { pricing, tailoringRequests = [] } = order;
  const grandTotal = pricing?.grandTotal || 0;
  const hasTailoring = tailoringRequests.length > 0 || pricing?.tailoringTotal > 0;

  // Calculate each party's share
  const platformFee = Math.round(grandTotal * PLATFORM_RATES.platformFee * 100) / 100;
  const deliveryAmount = Math.round(pricing?.deliveryFee || 0);
  const tailorAmount = hasTailoring
    ? Math.round((pricing?.tailoringTotal || 0) + (grandTotal * 0.05)) // Tailoring fee + 5% of order
    : 0;
  const shopkeeperAmount = Math.round(grandTotal - platformFee - deliveryAmount - tailorAmount);

  return {
    shopkeeperAmount: Math.max(0, shopkeeperAmount),
    tailorAmount,
    deliveryAmount,
    platformFee,
    processingFee: Math.round(grandTotal * 0.029 + 0.30), // ~2.9% + $0.30 (standard payment processing)
    totalDistributed: shopkeeperAmount + tailorAmount + deliveryAmount + platformFee,
    grandTotal,
  };
}

/**
 * Get platform commission rates (for admin dashboard)
 */
export function getPlatformRates() {
  return { ...PLATFORM_RATES };
}

/**
 * Format price for display
 */
export function formatPrice(amount, currency = "USD") {
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toLocaleString()} ${currency}`;
}
