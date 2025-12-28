import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    logo: { type: String }, // URL from Cloudinary
    banner: { type: String }, // URL from Cloudinary
    location: {
      address: String,
      city: String,
      state: String,
      coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
    },
    businessDetails: {
      ownerName: String,
      phone: String,
      taxId: String,
      businessType: String,
    },
    categoryPermissions: [String], // categories this shop can sell
    commissionAgreement: {
      percentage: { type: Number, default: 10 },
      agreedAt: Date,
      agreedToTerms: Boolean,
    },
    profileCompletion: {
      isComplete: { type: Boolean, default: false },
      percentage: { type: Number, default: 0 },
      missingFields: [String],
    },
    isActive: { type: Boolean, default: true, index: true },
    isVisibleToCustomers: { type: Boolean, default: true, index: true },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Shop || mongoose.model("Shop", ShopSchema);
