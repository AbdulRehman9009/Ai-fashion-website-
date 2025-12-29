import mongoose from "mongoose";

export const Roles = ["USER", "TAILOR", "DELIVERY", "SHOPKEEPER", "ADMIN"];

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Roles, default: "USER", index: true },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
    lastLogin: { type: Date },

    // Auth & Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // AI Usage Limits
    aiUsageCount: { type: Number, default: 0 },
    lastAiUsageDate: { type: Date },

    // Caching typical profile fields to reduce lookups
    name: { type: String },
    image: { type: String },

    // Profile Completion Tracking
    profileCompletion: {
      isComplete: { type: Boolean, default: false },
      percentage: { type: Number, default: 0 },
      missingFields: [String],
      lastChecked: Date,
    },

    // Customer-specific profile fields
    customerProfile: {
      measurementPreference: { type: String, enum: ["manual", "tailor"], default: "manual" },
      defaultPaymentMethod: String,
      agreedToTerms: { type: Boolean, default: false },
      termsAgreedAt: Date,
    },

    // Payout Method (replaces Stripe Connect)
    payoutMethod: {
      type: { type: String, enum: ["bank_transfer", "manual"], default: "manual" },
      bankDetails: {
        accountNumber: String,
        bankName: String,
        accountHolderName: String,
        iban: String,
      },
      isVerified: { type: Boolean, default: false },
    },

    // Tailor-specific profile fields
    tailorProfile: {
      location: {
        address: String,
        city: String,
        state: String,
        coordinates: { type: [Number], index: "2dsphere" },
      },
      availability: { type: Boolean, default: true },
      specialization: [String], // e.g., ["Formal", "Wedding", "Casual"]
      experience: Number, // years of experience
      ratingAvg: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      // Enhanced fields
      cnicId: String,
      phone: String,
      pricePerJob: Number,
      commissionPercentage: Number,
      agreedToTerms: Boolean,
    },

    // Delivery Person Profile
    deliveryProfile: {
      fullName: String,
      phone: String,
      cnicId: String,
      vehicleType: { type: String, enum: ["Bike", "Car", "Van", "Truck"] },
      licenseNumber: String,
      serviceAreas: [String], // cities they service
      perDeliveryFee: { type: Number, default: 10 },
      availability: { type: Boolean, default: true },
      agreedToTerms: Boolean,
      termsAgreedAt: Date,
    },

    // Admin Profile
    adminProfile: {
      canAccessAuditLogs: { type: Boolean, default: true },
      lastPasswordChange: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
