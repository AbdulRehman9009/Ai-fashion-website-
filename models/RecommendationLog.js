import mongoose from "mongoose";

const RecommendationLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    context: {
      eventType: String,
      userPreferences: Map,
      analysis: {
        skinTone: String,
        ageGroup: String,
        bodyShape: String,
      },
    },
    suggestedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    promptUsed: String,
    modelVersion: String,
  },
  { timestamps: true }
);

export default mongoose.models.RecommendationLog || mongoose.model("RecommendationLog", RecommendationLogSchema);
