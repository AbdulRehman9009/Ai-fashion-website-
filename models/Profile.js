import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
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
      height: Number, // cm
      weight: Number, // kg
      shirtSize: { type: String, enum: ["XS", "S", "M", "L", "XL", "XXL"] },
      pantSize: Number, // waist (in)
      shoeSize: Number, // US size
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
      newsletter: { type: Boolean, default: true },
    },
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: Date,
    refundPolicyAccepted: { type: Boolean, default: false },
    refundPolicyAcceptedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
