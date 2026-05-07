import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "@/models/Product";
import RecommendationLog from "@/models/RecommendationLog";
import { connectDB } from "@/lib/db";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const GEMINI_MODEL = "gemini-2.0-flash";
export async function generateOutfitRecommendations(imageBuffer, mimeType, context, userId) {
  try {
    await connectDB();
    if (!apiKey) {
      throw new Error("Gemini API key missing");
    }
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });


    
    const imageBase64 = imageBuffer.toString("base64");
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };
    
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

    
    let finalCandidates = candidates;
    if (candidates.length < 3) {
      const fallback = await Product.find().sort({ createdAt: -1 }).limit(5).populate("shop").lean();
      finalCandidates = [...candidates, ...fallback];
    }

    
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
        modelVersion: GEMINI_MODEL

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
