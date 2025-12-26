import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    location: {
      address: String,
      city: String,
      state: String,
      coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
    },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Shop || mongoose.model("Shop", ShopSchema);
