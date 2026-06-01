/**
 * AI Stylist API Route
 * Dedicated endpoint for AI-powered outfit recommendations
 * 
 * Takes an image URL (already uploaded to Cloudinary) and user preferences
 * Returns structured outfit recommendations with color combinations
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import RecommendationLog from "@/models/RecommendationLog";
import { getToken } from "next-auth/jwt";
import { withErrorHandler } from "@/lib/api-middleware";
import { successResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
    buildRecommendationProductMatches,
    normalizeGenderPreference,
} from "@/lib/ai/catalogMatching";

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);


const GEMINI_MODEL = "gemini-2.0-flash";
const SYSTEM_INSTRUCTION = `You are Style Genie, an expert AI fashion stylist specializing in South Asian, Pakistani, and international fashion. 
You have deep knowledge of fabrics like cotton, silk, chiffon, lawn, khaddar, and linen, as well as traditional garments like shalwar kameez, kurta, saree, and lehenga alongside modern western styles.
Always provide practical, specific, and culturally-sensitive fashion advice. Return ONLY valid JSON as specified - no extra text.`;

const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
    },
});


/**
 * POST /api/ai-stylist
 * Generate AI-powered outfit recommendations
 * 
 * @body {string} imageUrl - Cloudinary URL of uploaded user photo
 * @body {string} eventType - Type of event (Wedding, Party, Formal, etc.)
 * @body {string} skinTone - User's skin tone (optional)
 * @body {Object} preferences - Additional style preferences
 * 
 * @returns Structured JSON with outfit recommendations and color combinations
 */
async function aiStylistHandler(req) {
    await connectDB();

    // Get user info if logged in
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.sub || null;

    const body = await req.json();
    const { imageUrl, eventType, skinTone, preferences = {} } = body;
    const origin = req.nextUrl?.origin || process.env.NEXTAUTH_URL || "";
    const rawGenderPreference = preferences.gender || preferences.genderPreference || preferences.audience || body.gender;
    const requestedGender = rawGenderPreference && !["auto", "detect"].includes(String(rawGenderPreference).toLowerCase())
        ? normalizeGenderPreference(rawGenderPreference)
        : null;

    // Validate required fields
    if (!imageUrl) {
        throw new ValidationError("Image URL is required", [
            { field: "imageUrl", message: "Please upload an image first" }
        ]);
    }

    if (!eventType) {
        throw new ValidationError("Event type is required", [
            { field: "eventType", message: "Please select an event type" }
        ]);
    }

    // Step 1: Generate outfit analysis prompt
    const analysisPrompt = `
    Analyze this fashion request and provide personalized outfit recommendations.
    
    User Context:
    - Event Type: ${eventType}
    - Skin Tone: ${skinTone || "Not specified"}
    - Intended Outfit Gender Fit: ${requestedGender || "Auto detect the best clothing category"}
    - Style Preferences: ${JSON.stringify(preferences)}
    - Reference Image URL: ${imageUrl}
    
    Provide exactly 3 distinct outfit color combinations and styles. Consider Pakistani/South Asian fashion preferences as well as modern trends.
    Treat gender as outfit fit/category only. Do not make identity claims about the person; use the provided preference when present.
    
    Return ONLY valid JSON in this exact format:
    {
      "analysis": {
        "skinTone": "detected or provided skin tone",
        "occasion": "formal/casual/festive analysis",
        "seasonalSuggestion": "best season for recommended colors",
        "genderPresentation": "male/female/any outfit fit"
      },
      "recommendations": [
        {
          "id": 1,
          "colorCombination": {
            "primary": "#HEX_COLOR",
            "secondary": "#HEX_COLOR", 
            "accent": "#HEX_COLOR"
          },
          "colorNames": ["Color 1", "Color 2", "Color 3"],
          "style": "Traditional/Modern/Fusion/Contemporary",
          "outfitType": "Shalwar Kameez/Kurta/Suit/Dress/Saree etc",
          "targetGender": "male/female/any",
          "description": "Brief description of the look",
          "stylingTips": "Specific and actionable styling advice",
          "accessories": ["Accessory 1", "Accessory 2"],
          "searchTags": ["tag1", "tag2", "tag3"]
        }
      ],
      "generalTips": "Overall styling advice for this person and event"
    }
  `;

    let aiResponse;
    try {
        if (!apiKey) {
            throw new Error("Gemini API key not configured");
        }

        const result = await model.generateContent([
            { role: "user", parts: [{ text: analysisPrompt }] }
        ]);

        const responseText = result.response.text()
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        aiResponse = JSON.parse(responseText);

        logger.info("AI Stylist response generated", {
            userId,
            eventType,
            recommendationCount: aiResponse.recommendations?.length || 0
        });

    } catch (parseError) {
        logger.warn("AI response parsing failed, using fallback", {
            error: parseError.message
        });

        // Fallback response
        aiResponse = generateFallbackRecommendations(eventType, skinTone, requestedGender);
    }

    // Step 2: Check the available catalog and rank products per recommendation.
    let availableProducts = [];
    try {
        availableProducts = await Product.find({ isActive: true, stock: { $gt: 0 } })
            .sort({ createdAt: -1 })
            .populate("shop", "name logo isActive isVisibleToCustomers ratingAvg")
            .lean();
    } catch (dbError) {
        logger.error("Available product lookup failed", { error: dbError.message });
    }

    const detectedGender = normalizeGenderPreference(aiResponse.analysis?.genderPresentation);
    const effectiveGender = requestedGender || detectedGender || "any";
    const matchResult = buildRecommendationProductMatches(availableProducts, aiResponse.recommendations || [], {
        eventType,
        style: preferences.style,
        genderPreference: effectiveGender,
    });
    const recommendationsWithProducts = matchResult.recommendations;
    for (const recommendation of recommendationsWithProducts) {
        recommendation.matchedProducts = recommendation.matchedProducts.map((product) => ({
            ...product,
            productUrl: product.productUrl,
            absoluteProductUrl: origin ? new URL(product.productUrl, origin).toString() : product.productUrl,
            absoluteShopUrl: product.shopUrl && origin ? new URL(product.shopUrl, origin).toString() : product.shopUrl,
        }));
    }

    // Step 4: Log recommendation for analytics
    if (userId) {
        try {
            await RecommendationLog.create({
                user: userId,
                context: {
                    eventType,
                    skinTone,
                    genderPreference: effectiveGender,
                    userPreferences: preferences,
                    imageUrl
                },
                suggestedProducts: matchResult.matchedProductIds,
                promptUsed: "AI Stylist v4 catalog-aware",
                modelVersion: GEMINI_MODEL

            });
        } catch (logError) {
            logger.error("Failed to log recommendation", { error: logError.message });
        }
    }

    return successResponse({
        analysis: aiResponse.analysis,
        recommendations: recommendationsWithProducts,
        generalTips: aiResponse.generalTips,
        genderFilter: effectiveGender,
        availableProductsChecked: matchResult.availableProductsChecked,
        totalProductsMatched: matchResult.matchedProductIds.length
    });
}

/**
 * Generate fallback recommendations when AI fails
 */
function generateFallbackRecommendations(eventType, skinTone, genderPreference = "any") {
    const eventColors = {
        Wedding: [
            { primary: "#D4AF37", secondary: "#8B0000", accent: "#FFD700", names: ["Gold", "Maroon", "Champagne"] },
            { primary: "#FF69B4", secondary: "#FFB6C1", accent: "#FF1493", names: ["Pink", "Blush", "Fuchsia"] },
            { primary: "#FF0000", secondary: "#FFD700", accent: "#228B22", names: ["Red", "Gold", "Green"] }
        ],
        Party: [
            { primary: "#000000", secondary: "#C0C0C0", accent: "#FFD700", names: ["Black", "Silver", "Gold"] },
            { primary: "#4B0082", secondary: "#9400D3", accent: "#DA70D6", names: ["Indigo", "Violet", "Orchid"] },
            { primary: "#FF0000", secondary: "#000000", accent: "#FFFFFF", names: ["Red", "Black", "White"] }
        ],
        Formal: [
            { primary: "#000080", secondary: "#FFFFFF", accent: "#808080", names: ["Navy", "White", "Gray"] },
            { primary: "#36454F", secondary: "#F5F5DC", accent: "#CD853F", names: ["Charcoal", "Beige", "Tan"] },
            { primary: "#000000", secondary: "#FFFFFF", accent: "#000080", names: ["Black", "White", "Navy"] }
        ],
        Casual: [
            { primary: "#4169E1", secondary: "#FFFFFF", accent: "#F0E68C", names: ["Royal Blue", "White", "Khaki"] },
            { primary: "#228B22", secondary: "#F5F5DC", accent: "#8B4513", names: ["Forest Green", "Beige", "Brown"] },
            { primary: "#87CEEB", secondary: "#FFFAFA", accent: "#FFB6C1", names: ["Sky Blue", "Snow", "Pink"] }
        ]
    };

    const colors = eventColors[eventType] || eventColors.Casual;

    const genderOutfits = {
        male: {
            Wedding: "Sherwani/Kurta Pajama",
            Formal: "Suit/Blazer",
            Casual: "Kurta/Smart Casual",
            Party: "Statement Shirt/Jacket",
        },
        female: {
            Wedding: "Lehenga/Saree",
            Formal: "Elegant Suit/Dress",
            Casual: "Kurti/Smart Casual",
            Party: "Dress/Fusion Wear",
        },
        any: {
            Wedding: "Traditional Wear",
            Formal: "Suit/Blazer",
            Casual: "Smart Casual",
            Party: "Fusion Wear",
        },
    };
    const outfitMap = genderOutfits[genderPreference] || genderOutfits.any;

    return {
        analysis: {
            skinTone: skinTone || "Warm undertones (analyzed)",
            occasion: `${eventType} - ${eventType === 'Formal' ? 'Professional' : eventType === 'Wedding' ? 'Festive' : 'Relaxed'} setting`,
            seasonalSuggestion: "All seasons",
            genderPresentation: genderPreference
        },
        recommendations: colors.map((c, i) => ({
            id: i + 1,
            colorCombination: {
                primary: c.primary,
                secondary: c.secondary,
                accent: c.accent
            },
            colorNames: c.names,
            style: i === 0 ? "Classic" : i === 1 ? "Contemporary" : "Bold",
            outfitType: outfitMap[eventType] || outfitMap.Casual,
            targetGender: genderPreference,
            description: `A ${i === 0 ? 'timeless' : i === 1 ? 'modern' : 'statement'} look perfect for ${eventType.toLowerCase()} occasions.`,
            stylingTips: "Pair with minimal accessories for a balanced look.",
            accessories: ["Statement watch", "Elegant footwear"],
            searchTags: [eventType.toLowerCase(), genderPreference, ...c.names.map(n => n.toLowerCase())]
        })),
        generalTips: "Choose fabrics that suit the weather and always prioritize comfort alongside style."
    };
}

export const POST = withErrorHandler(aiStylistHandler);
