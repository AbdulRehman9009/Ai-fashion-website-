import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: {
            type: String,
            enum: [
                "order_placed",
                "order_accepted",
                "order_completed",
                "payment_received",
                "delivery_assigned",
                "tailor_assigned",
                "order_status_update"
            ],
            required: true
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        isRead: { type: Boolean, default: false, index: true },
        metadata: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
