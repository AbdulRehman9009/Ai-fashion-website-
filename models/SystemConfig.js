import mongoose from "mongoose";

const SystemConfigSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true, index: true },
        value: mongoose.Schema.Types.Mixed,
        description: String,
        category: { type: String, default: "general" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export default mongoose.models.SystemConfig || mongoose.model("SystemConfig", SystemConfigSchema);
