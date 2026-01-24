import mongoose from "mongoose";

const PayoutSchema = new mongoose.Schema(
    {
        // Who receives the payout
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        // Associated order
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true
        },
        // Payout amount in cents (for precision)
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        // Currency
        currency: {
            type: String,
            default: "USD"
        },
        // Type of payout
        type: {
            type: String,
            enum: ["product_sale", "tailoring_fee", "delivery_fee", "platform_fee"],
            required: true,
            index: true
        },
        // Provider role for filtering
        providerRole: {
            type: String,
            enum: ["SHOPKEEPER", "TAILOR", "DELIVERY", "ADMIN"],
            required: true,
            index: true
        },
        // Status of payout
        status: {
            type: String,
            enum: ["pending", "paid_by_admin"],
            default: "pending",
            index: true
        },
        // When admin marked as paid
        paidAt: {
            type: Date,
            default: null
        },
        // Admin who processed the payout
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        // Admin notes
        notes: {
            type: String,
            default: ""
        },
        // For idempotency - unique key to prevent duplicate payouts
        idempotencyKey: {
            type: String,
            unique: true,
            sparse: true
        }
    },
    { timestamps: true }
);

// Compound index for faster queries
PayoutSchema.index({ status: 1, providerRole: 1 });
PayoutSchema.index({ userId: 1, status: 1 });

// Static method to get pending payouts summary
PayoutSchema.statics.getPendingSummary = async function () {
    const result = await this.aggregate([
        { $match: { status: "pending" } },
        {
            $group: {
                _id: "$providerRole",
                totalAmount: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        }
    ]);

    return result.reduce((acc, item) => {
        acc[item._id] = { amount: item.totalAmount, count: item.count };
        return acc;
    }, {});
};

// Static method to get total pending amount
PayoutSchema.statics.getTotalPending = async function () {
    const result = await this.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    return result[0]?.total || 0;
};

export default mongoose.models.Payout || mongoose.model("Payout", PayoutSchema);
