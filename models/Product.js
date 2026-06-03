import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    title: { type: String, required: true, trim: true },
    description: String,
    category: { type: String, required: true }, // e.g., "Saree", "Suit", "Lehenga"
    tags: [String], // e.g., "Silk", "Party", "Red"
    basePrice: { type: Number, required: true },
    images: [String], // URLs
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    audience: {
      type: String,
      enum: ["MEN", "WOMEN", "UNISEX"],
      default: "UNISEX",
      index: true,
    },
    type: { type: String, enum: ["STITCHED", "UNSTITCHED", "READY_TO_WEAR"], default: "READY_TO_WEAR" },
    attributes: {
      color: String,
      fabric: String,
      pattern: String,
    },
    // Paddle Integration
    paddleProductId: String,
    paddlePriceId: String,
    paddleSyncStatus: {
      type: String,
      enum: ["pending", "synced", "failed"],
      default: "pending",
    },
    paddleSyncError: String,
  },
  { timestamps: true }
);

ProductSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
