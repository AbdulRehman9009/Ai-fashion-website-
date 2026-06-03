import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { title, category, imageUrl } = body;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: "You are an expert fashion copywriter and catalog manager. Return ONLY valid JSON."
        });

        const prompt = `
            Analyze this fashion product:
            Title: ${title || 'Unknown'}
            Category: ${category || 'Unknown'}
            Image URL: ${imageUrl || 'None'}

            Generate:
            1. A rich, compelling 'description' (2-3 paragraphs) that highlights the style, potential occasions, and craftsmanship.
            2. The target 'audience' (MUST be exactly one of: "MEN", "WOMEN", "UNISEX").
            3. The product 'type' (MUST be exactly one of: "READY_TO_WEAR", "STITCHED", "UNSTITCHED").
            4. A list of 5-8 relevant SEO 'tags'.

            Return valid JSON in this exact format:
            {
                "description": "...",
                "audience": "...",
                "type": "...",
                "tags": ["..."]
            }
        `;

        let imagePart = null;
        if (imageUrl) {
            try {
                const imgRes = await fetch(imageUrl);
                const arrayBuffer = await imgRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
                imagePart = {
                    inlineData: {
                        data: buffer.toString("base64"),
                        mimeType: mimeType
                    }
                };
            } catch (err) {
                console.warn("Failed to fetch image for AI generation", err);
            }
        }

        const parts = [];
        if (imagePart) parts.push(imagePart);
        parts.push({ text: prompt });

        const result = await model.generateContent([{ role: "user", parts }]);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        const aiResponse = JSON.parse(responseText);

        return NextResponse.json(aiResponse);

    } catch (error) {
        console.error("AI Product Details error:", error);
        return NextResponse.json({ error: "Failed to generate details" }, { status: 500 });
    }
}
