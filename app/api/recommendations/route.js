import { NextResponse } from "next/server";
import { generateOutfitRecommendations } from "@/lib/ai/recommend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    // Optional: require auth or allow guest (let's allow guest for demo, but track if logged in)
    const userId = session?.user?.id || null;

    const formData = await req.formData();
    const image = formData.get("image");
    const eventType = formData.get("eventType");
    const preferences = formData.get("preferences");

    if (!image || !eventType) {
      return NextResponse.json({ error: "Missing image or event type" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const mimeType = image.type;

    let parsedPrefs = {};
    try {
        parsedPrefs = JSON.parse(preferences || "{}");
    } catch (e) {}

    const result = await generateOutfitRecommendations(
        buffer, 
        mimeType, 
        { eventType, preferences: parsedPrefs },
        userId
    );

    const origin = req.nextUrl?.origin || process.env.NEXTAUTH_URL || "";
    if (origin && Array.isArray(result.recommendations)) {
      result.recommendations = result.recommendations.map((recommendation) => ({
        ...recommendation,
        product: recommendation.product ? {
          ...recommendation.product,
          absoluteProductUrl: new URL(recommendation.product.productUrl || `/products/${recommendation.product.id}`, origin).toString(),
          absoluteShopUrl: recommendation.product.shopUrl ? new URL(recommendation.product.shopUrl, origin).toString() : recommendation.product.shopUrl,
        } : null,
      }));
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
