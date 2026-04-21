/**
 * Pricing Module
 * Handles order pricing calculations.
 * 
 * NOTE: Payment distribution (splitting revenue between shopkeeper/tailor/delivery/platform)
 * is handled by lib/payment-distribution.js — the SINGLE SOURCE OF TRUTH.
 * This file only handles ORDER PRICE COMPUTATION (totals, taxes, fees).
 */

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
 * Format price for display
 */
export function formatPrice(amount, currency = "USD") {
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toLocaleString()} ${currency}`;
}
