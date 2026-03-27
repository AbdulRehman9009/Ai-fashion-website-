import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
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
}, { _id: false });

const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        // Denormalized shop reference — enables O(1) multi-shop conflict check
        // without populating all cart items every request.
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            default: null
        },
        items: [CartItemSchema],
        // TTL: remove carts that haven't been updated in 90 days
        lastActivity: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Auto-update lastActivity on every save
CartSchema.pre("save", function () {
    this.lastActivity = new Date();
});

// Ensure unique cart per user
CartSchema.index({ user: 1 }, { unique: true });

// TTL index — cart docs expire 90 days after lastActivity
CartSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
