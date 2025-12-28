import mongoose from "mongoose";

const EarningSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
        amount: { type: Number, required: true },
        type: {
            type: String,
            enum: ["product_sale", "tailoring", "delivery", "platform_fee"],
            required: true,
            index: true
        },
        status: {
            type: String,
            enum: ["pending", "available", "paid", "failed"],
            default: "pending",
            index: true
        },
        // Paddle payout tracking
        payoutReference: String, // Paddle payout ID or manual reference
        payoutMethod: { type: String, enum: ["paddle", "manual", "bank_transfer"], default: "manual" },
        payoutBatchId: String,
        paidAt: Date,
        failureReason: String,
        retryCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

EarningSchema.index({ user: 1, createdAt: -1 });
EarningSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Earning || mongoose.model("Earning", EarningSchema);
