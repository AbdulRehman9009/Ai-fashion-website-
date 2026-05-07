import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true, trim: true },


    method: {
      type: String,
      enum: ["CARD", "MANUAL", "PADDLE", "BANK_TRANSFER", "CASH_ON_DELIVERY"],
      default: "CARD"
    },
    status: {
      type: String,
      enum: ["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"],
      default: "PENDING",
      index: true
    },

    transactionId: { type: String, unique: true, sparse: true },
    paddleTransactionId: { type: String, sparse: true, index: true },
    paddleCustomerId: { type: String, sparse: true },

    refundAmount: { type: Number, default: 0, min: 0 },
    refundReason: { type: String },
    refundedAt: { type: Date },

    providerData: { type: mongoose.Schema.Types.Mixed },

    
    paymentMethodDetails: {
      brand: String,
      last4: String,
      expiryMonth: Number,
      expiryYear: Number,
    },
    
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

// Indexes for admin dashboard queries
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ paddleTransactionId: 1 });

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
