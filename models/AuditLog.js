import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
    {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        action: { type: String, required: true, index: true },
        targetType: { type: String, required: true },
        targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
        targetEmail: String,
        details: { type: mongoose.Schema.Types.Mixed },
        ipAddress: String,
    },
    { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ admin: 1, createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
