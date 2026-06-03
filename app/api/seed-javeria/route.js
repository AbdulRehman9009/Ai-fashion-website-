import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { createPaddleProduct } from "@/lib/paddle/paddleClient";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        
        const shopId = "6a20364e57df469a844fa7dd"; // Javeria Store
        
        // 1. Delete previous products of this shop
        await Product.deleteMany({ shop: shopId });
        console.log("Deleted old products for Javeria Store");

        // 2. 13 new products with high-quality, verified visible clothing images
        const products = [
            {
                title: "Midnight Black Velvet Sherwani",
                description: "A premium midnight black velvet sherwani perfect for grooms and royal wedding events. Features intricate hand-embroidered silver zardozi borders and a structured tailored silhouette.",
                basePrice: 299,
                stock: 12,
                type: "READY_TO_WEAR",
                category: "Wedding",
                audience: "MEN",
                images: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80"],
                tags: ["Sherwani", "Velvet", "Wedding", "Black", "Royal"]
            },
            {
                title: "Rose Gold Silk Banarasi Saree",
                description: "Exquisite rose gold Banarasi saree woven in pure silk. Heavily decorated with antique gold zari work and floral brocades. Perfect for heritage wedding wear.",
                basePrice: 180,
                stock: 8,
                type: "READY_TO_WEAR",
                category: "Festive",
                audience: "WOMEN",
                images: ["https://images.unsplash.com/photo-1610030469983-98e5509c5328?w=800&q=80"],
                tags: ["Saree", "Banarasi", "Silk", "Rose Gold", "Traditional"]
            },
            {
                title: "Crimson Red Bridal Lehenga",
                description: "Luxurious crimson red silk lehenga set featuring dense gold tilla and sequin embroidery. Perfect for brides who want a classic, head-turning look on their big day.",
                basePrice: 499,
                stock: 4,
                type: "STITCHED",
                category: "Wedding",
                audience: "WOMEN",
                images: ["https://images.unsplash.com/photo-1583391733958-6c782781878d?w=800&q=80"],
                tags: ["Lehenga", "Bridal", "Wedding", "Red", "Embroidery"]
            },
            {
                title: "Mint Green Linen Kurta Set",
                description: "Comfortable, premium linen-blend mint green kurta paired with white trousers. Crafted for lightweight, breathable casual daily wear.",
                basePrice: 55,
                stock: 25,
                type: "READY_TO_WEAR",
                category: "Casual",
                audience: "MEN",
                images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80"],
                tags: ["Kurta", "Linen", "Green", "Casual", "Summer"]
            },
            {
                title: "Peach Chiffon Embroidered Suit",
                description: "Semi-formal pastel peach georgette/chiffon three-piece suit. Decorated with delicate white threadwork and paired with a soft organza dupatta.",
                basePrice: 120,
                stock: 15,
                type: "STITCHED",
                category: "Party",
                audience: "WOMEN",
                images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"],
                tags: ["Suit", "Chiffon", "Peach", "Embroidered", "Elegant"]
            },
            {
                title: "Classic Ivory Karandi Unstitched",
                description: "Top-grade unstitched Ivory Karandi fabric (4.5 meters). Perfect for customizing your own bespoke traditional kurta or shalwar kameez.",
                basePrice: 75,
                stock: 40,
                type: "UNSTITCHED",
                category: "Casual",
                audience: "MEN",
                images: ["https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80"],
                tags: ["Karandi", "Unstitched", "Ivory", "Kurta", "Fabric"]
            },
            {
                title: "Indigo Blue Block-Print Lawn Suit",
                description: "Unstitched 3-piece pure lawn suit with vibrant indigo block-printed designs. Includes shirt fabric, printed trouser, and a soft matching chiffon dupatta.",
                basePrice: 45,
                stock: 60,
                type: "UNSTITCHED",
                category: "Casual",
                audience: "WOMEN",
                images: ["https://images.unsplash.com/photo-1608748010899-18f300247112?w=800&q=80"],
                tags: ["Lawn", "Block Print", "Blue", "Unstitched", "Summer"]
            },
            {
                title: "Charcoal Grey Casual Shalwar Kameez",
                description: "Ready-to-wear charcoal grey soft wash-and-wear fabric shalwar kameez. Wrinkle-resistant and perfect for comfortable daily wear.",
                basePrice: 65,
                stock: 35,
                type: "READY_TO_WEAR",
                category: "Casual",
                audience: "MEN",
                images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"],
                tags: ["Shalwar Kameez", "Grey", "Casual", "Wash and Wear"]
            },
            {
                title: "Golden Mustard Georgette Anarkali",
                description: "Beautifully draped golden mustard georgette Anarkali gown with light embroidery on the neck and sleeves. Ideal for festive gatherings.",
                basePrice: 210,
                stock: 10,
                type: "STITCHED",
                category: "Festive",
                audience: "WOMEN",
                images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80"],
                tags: ["Anarkali", "Georgette", "Yellow", "Festive", "Gown"]
            },
            {
                title: "White Chikankari Kurta",
                description: "Handcrafted pure cotton white Lucknowi Chikankari kurta. Elegant, breezy, and perfect for hot summer days.",
                basePrice: 85,
                stock: 20,
                type: "READY_TO_WEAR",
                category: "Summer",
                audience: "WOMEN",
                images: ["https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80"],
                tags: ["Chikankari", "Kurta", "White", "Cotton", "Summer"]
            },
            {
                title: "Royal Velvet Shawl (Unisex)",
                description: "Luxuriously thick royal blue velvet shawl with gold tilla borders. Designed to be styled by both men and women for winter celebrations.",
                basePrice: 110,
                stock: 18,
                type: "READY_TO_WEAR",
                category: "Winter",
                audience: "UNISEX",
                images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"],
                tags: ["Shawl", "Velvet", "Winter", "Blue", "Unisex"]
            },
            {
                title: "Designer Raw Silk Waistcoat",
                description: "Sleek, structured waist coat made of premium raw silk. Features customized brass buttons. Perfect addition over a plain white kurta pajama.",
                basePrice: 95,
                stock: 14,
                type: "READY_TO_WEAR",
                category: "Formal",
                audience: "MEN",
                images: ["https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=800&q=80"],
                tags: ["Waistcoat", "Raw Silk", "Formal", "Wedding", "Gold"]
            },
            {
                title: "Lilac Organza Embroidered Dupatta",
                description: "Lightweight lilac organza dupatta with beautifully scalloped edges and floral embroidery. The perfect accessory to complete any festive look.",
                basePrice: 35,
                stock: 50,
                type: "READY_TO_WEAR",
                category: "Accessories",
                audience: "WOMEN",
                images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80"],
                tags: ["Dupatta", "Organza", "Lilac", "Accessories", "Embroidered"]
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
        
        return NextResponse.json({ message: "Seed successful for Javeria Store", count: products.length, results });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
