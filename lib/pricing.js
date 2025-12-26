export function computePricing({ items, tailoringRequests = [], urgent = false, deliveryZone = "standard", taxRate = 0.1, currency = "USD" }) {
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
  return { itemsTotal, tailoringTotal, deliveryFee, tax, discount, serviceFee, urgentFee, grandTotal, currency };
}

