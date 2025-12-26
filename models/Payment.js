import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, default: "CARD" },
    status: { type: String, enum: ["PENDING", "AUTHORIZED", "PAID", "REFUNDED"], default: "PENDING", index: true },
    transactionId: { type: String, unique: true, sparse: true },
    providerData: {},
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

