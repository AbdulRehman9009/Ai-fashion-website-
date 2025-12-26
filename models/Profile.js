import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    addresses: [
      {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      inseam: Number,
      shoulders: Number,
      custom: { type: Map, of: Number },
    },
    preferences: {
      styles: [String],
      colors: [String],
      brands: [String],
      fit: { type: String, enum: ["SLIM", "REGULAR", "LOOSE"], default: "REGULAR" },
      budgetRange: { min: Number, max: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
