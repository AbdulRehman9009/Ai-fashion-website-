import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "@/models/Product";
import RecommendationLog from "@/models/RecommendationLog";
import { connectDB } from "@/lib/db";

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Analyzes user image and preferences to recommend outfits.
 * 
 * @param {Buffer} imageBuffer - The uploaded user image buffer
 * @param {string} mimeType - Image mime type
 * @param {Object} context - User context { eventType, preferences, etc. }
 * @param {string} userId - ID of the requesting user
 */
export async function generateOutfitRecommendations(imageBuffer, mimeType, context, userId) {
  try {
    await connectDB();
    if (!apiKey) {
      throw new Error("Gemini API key missing");
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 1. Convert buffer to base64 for Gemini
    const imageBase64 = imageBuffer.toString("base64");
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    // 2. Fetch available inventory summary for context (optimization: limit fields)
    // In a real app with thousands of products, we would use vector search here.
    // For MVP, we'll fetch a sample or rely on Gemini to generate search terms.
    // Let's fetch top 50 diverse products to "simulate" a catalog knowledge for the AI 
    // or we can ask AI to generate keywords and then we search DB. 
    // APPROACH: Ask AI for keywords -> DB Search -> Rerank/Filter

    // Step 2a: Analyze Image & Context
    const analysisPrompt = `
      Analyze this user's image and the following context:
      Event: ${context.eventType}
      Preferences: ${JSON.stringify(context.preferences)}
      
      Determine:
      1. Skin tone (e.g., Fair, Medium, Dark, Warm/Cool undertone)
      2. Apparent Age Group
      3. Body Shape/Type (approximate)
      4. Best 3 colors for this person for the event
      5. Best 3 fabrics suitable for the event
      6. A helpful styling tip for this person (1-2 sentences)
      
      Return valid JSON only:
      {
        "skinTone": "...",
        "ageGroup": "...",
        "bodyShape": "...",
        "recommendedColors": ["..."],
        "recommendedFabrics": ["..."],
        "stylingTips": "...",
        "searchKeywords": ["..."] 
      }
    `;

    let analysis;
    try {
      const analysisResult = await model.generateContent([
        { role: "user", parts: [imagePart, { text: analysisPrompt }] },
      ]);
      const analysisText = analysisResult.response.text().replace(/```json|```/g, "").trim();
      analysis = JSON.parse(analysisText);
    } catch (e) {
      const fallbackColors = (() => {
        switch (String(context.eventType || "").toLowerCase()) {
          case "wedding": return ["Gold", "Red", "Pastel Pink"];
          case "party": return ["Black", "Red", "Silver"];
          case "formal": return ["Navy", "Black", "Charcoal"];
          default: return ["Blue", "White", "Beige"];
        }
      })();
      analysis = {
        skinTone: "Unknown",
        ageGroup: "Adult",
        bodyShape: "Unknown",
        recommendedColors: fallbackColors,
        recommendedFabrics: ["Silk", "Cotton", "Linen"],
        stylingTips: "Wear what makes you feel confident! Try matching accessories with your outfit color.",
        searchKeywords: [context.eventType || "outfit", ...(context.preferences?.style ? [context.preferences.style] : [])],
      };
    }

    // 3. Search Database based on AI keywords
    // Construct a mongo query from keywords + colors
    const searchTerms = [...(analysis.searchKeywords || []), ...(analysis.recommendedColors || [])].join(" ");

    // Simple text search
    const candidates = await Product.find(
      { $text: { $search: searchTerms } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .populate("shop")
      .lean();

    // If no text match, fallback to latest products
    let finalCandidates = candidates;
    if (candidates.length < 3) {
      const fallback = await Product.find().sort({ createdAt: -1 }).limit(5).populate("shop").lean();
      finalCandidates = [...candidates, ...fallback];
    }

    // 4. Generate Final Recommendation with Styling Tips
    // We send the candidate products to AI to choose the best ones and explain why.
    const candidateDescriptions = finalCandidates.map(p =>
      `ID: ${p._id}, Title: ${p.title}, Color: ${p.attributes.color}, Type: ${p.type}, Price: ${p.basePrice}`
    ).join("\n");

    const recommendationPrompt = `
      Based on the user analysis: ${JSON.stringify(analysis)}
      And these available products:
      ${candidateDescriptions}

      Select the top 3 outfits. For each, provide a styling tip and why it suits the user/event.
      
      Return JSON:
      {
        "recommendations": [
          {
            "productId": "ID",
            "reason": "...",
            "stylingTip": "..."
          }
        ]
      }
    `;

    let recData = { recommendations: [] };
    try {
      const recResult = await model.generateContent([{ role: "user", parts: [{ text: recommendationPrompt }] }]);
      const recText = recResult.response.text().replace(/```json|```/g, "").trim();
      recData = JSON.parse(recText);
    } catch {
      recData = {
        recommendations: finalCandidates.slice(0, 3).map(p => ({
          productId: String(p._id),
          reason: `Matches event "${context.eventType}" and recommended colors.`,
          stylingTip: "Pair with minimal accessories for a balanced look.",
        })),
      };
    }

    // 5. Merge AI result with DB data
    const finalRecommendations = recData.recommendations.map(rec => {
      const product = finalCandidates.find(p => String(p._id) === String(rec.productId));
      return {
        ...rec,
        product: product || null
      };
    }).filter(r => r.product !== null);

    // 6. Log interaction
    if (userId) {
      await RecommendationLog.create({
        user: userId,
        context: {
          eventType: context.eventType,
          userPreferences: context.preferences,
          analysis: {
            skinTone: analysis.skinTone,
            ageGroup: analysis.ageGroup,
            bodyShape: analysis.bodyShape
          }
        },
        suggestedProducts: finalRecommendations.map(r => r.product._id),
        promptUsed: "Analysis + Ranking",
        modelVersion: "gemini-1.5-flash-latest"
      });
    }

    return {
      analysis,
      recommendations: finalRecommendations
    };

  } catch (error) {
    const safeMessage = String(error?.message || "");
    if (safeMessage.includes("Gemini API key missing")) {
      return {
        analysis: {
          skinTone: "Unknown",
          ageGroup: "Adult",
          bodyShape: "Unknown",
          recommendedColors: ["Blue", "White"],
          stylingTips: "Please check your API key configuration.",
        },
        recommendations: [],
        error: "AI temporarily unavailable. Please configure GEMINI_API_KEY.",
      };
    }
    return {
      analysis: {
        skinTone: "Unknown",
        ageGroup: "Adult",
        bodyShape: "Unknown",
        recommendedColors: ["Black", "Navy"],
        stylingTips: "We couldn't generate a specific tip right now.",
      },
      recommendations: [],
      error: "Failed to generate recommendations",
    };
  }
}
