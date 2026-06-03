import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { createPaddleProduct } from "@/lib/paddle/paddleClient";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        
        const shopId = "6a20364e57df469a844fa7dd"; // Javeria Store
        
        const products = [
            {
                title: "Royal Blue Silk Sherwani",
                description: "A premium royal blue silk sherwani perfect for weddings and formal events. Features intricate golden embroidery and a tailored fit.",
                basePrice: 250,
                stock: 10,
                type: "READY_TO_WEAR",
                category: "Wedding",
                audience: "MEN",
                images: ["https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80"],
                tags: ["Sherwani", "Silk", "Wedding", "Royal Blue"]
            },
            {
                title: "Emerald Green Embroidered Lehenga",
                description: "Stunning emerald green lehenga with heavy zardozi embroidery. Perfect for bridal or festive wear. Includes a matching dupatta.",
                basePrice: 350,
                stock: 5,
                type: "STITCHED",
                category: "Wedding",
                audience: "WOMEN",
                images: ["https://images.unsplash.com/photo-1610030469983-98e5509c5328?w=800&q=80"],
                tags: ["Lehenga", "Embroidered", "Bridal", "Green"]
            },
            {
                title: "Classic Cotton Kurta Pajama",
                description: "Comfortable and classic white cotton kurta pajama. Ideal for casual wear or summer festivities.",
                basePrice: 45,
                stock: 30,
                type: "READY_TO_WEAR",
                category: "Casual",
                audience: "MEN",
                images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80"],
                tags: ["Kurta", "Cotton", "White", "Summer"]
            },
            {
                title: "Floral Lawn Unstitched Suit",
                description: "Premium floral print lawn fabric for summer. Includes 3 meters of shirt fabric, 2.5 meters trouser fabric, and a chiffon dupatta.",
                basePrice: 65,
                stock: 50,
                type: "UNSTITCHED",
                category: "Casual",
                audience: "WOMEN",
                images: ["https://images.unsplash.com/photo-1583391733958-6c782781878d?w=800&q=80"],
                tags: ["Lawn", "Floral", "Summer", "Suit"]
            }
        ];

        let results = [];

        for (const p of products) {
            // Step 1: Create in Paddle Sandbox
            const paddleRes = await createPaddleProduct({
                name: p.title,
                description: p.description,
                price: p.basePrice,
                currency: "USD",
                imageUrl: p.images[0]
            });

            // Step 2: Save to MongoDB
            const newProduct = new Product({
                ...p,
                shop: shopId,
                isActive: true,
                paddleProductId: paddleRes.success ? paddleRes.productId : null,
                paddlePriceId: paddleRes.success ? paddleRes.priceId : null,
                paddleSyncStatus: paddleRes.success ? "synced" : "failed",
                paddleSyncError: paddleRes.success ? null : paddleRes.error
            });
            
            await newProduct.save();
            results.push(`Added: ${p.title} (Paddle Sync: ${paddleRes.success ? 'Success' : 'Failed'})`);
        }
        
        return NextResponse.json({ message: "Seed successful for Javeria Store", results });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
