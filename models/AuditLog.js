import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
    {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        action: { type: String, required: true, index: true }, // e.g., "USER_DEACTIVATED", "SHOP_HIDDEN"
        targetType: { type: String, required: true }, // "USER", "SHOP", "TAILOR", "ORDER"
        targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
        targetEmail: String, // For easier searching
        details: { type: mongoose.Schema.Types.Mixed }, // Additional context
        ipAddress: String,
    },
    { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ admin: 1, createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
