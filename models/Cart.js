import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1
                },
                selectedOptions: {
                    size: String,
                    color: String,
                    customizations: mongoose.Schema.Types.Mixed
                },
                addedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    { timestamps: true }
);

// Ensure a user can only have one cart
CartSchema.index({ user: 1 }, { unique: true });

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
