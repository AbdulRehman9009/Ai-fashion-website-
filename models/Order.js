import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    tailoringRequests: [
      {
        name: String,
        price: { type: Number, default: 0 },
        notes: String,
      },
    ],
    urgent: { type: Boolean, default: false },
    pricing: {
      itemsTotal: { type: Number, default: 0 },
      tailoringTotal: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      urgentFee: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },
    status: {
      type: String,
      enum: [
        "OrderCreated",
        "PaymentPending",
        "PaymentConfirmed",
        "TailoringPending",
        "TailoringInProgress",
        "TailoringCompleted",
        "DeliveryPending",
        "OutForPickup",
        "PickedUp",
        "OutForDelivery",
        "Delivered",
        "Completed",
        "Canceled",
      ],
      default: "OrderCreated",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "AUTHORIZED", "PAID", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    delivery: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },
    assignedTailor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timeline: [
      {
        at: { type: Date, default: Date.now },
        byRole: String,
        event: String,
        notes: String,
      },
    ],
    shippingAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);

