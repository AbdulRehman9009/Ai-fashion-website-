import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Shop from "@/models/Shop";
import Product from "@/models/Product";
import bcrypt from "bcryptjs";
import { createPaddleProduct } from "@/lib/paddle/paddleClient";

export async function GET(req) {
    try {
        await connectDB();

        // 1. Ensure Javeria Store Shopkeeper User exists
        const shopkeeperId = "6a20360a57df469a844fa7dc";
        let shopkeeper = await User.findById(shopkeeperId);
        if (!shopkeeper) {
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash("Javeria123!", salt);
            shopkeeper = await User.create({
                _id: shopkeeperId,
                email: "javeria@store.com",
                passwordHash,
                role: "SHOPKEEPER",
                status: "ACTIVE",
                name: "Javeria Munawar",
                emailVerified: true,
                profileCompletion: {
                    isComplete: true,
                    percentage: 100,
                }
            });
            console.log("Created shopkeeper user javeria@store.com");
        }

        // 2. Ensure Javeria Store Shop exists
        const shopId = "6a20364e57df469a844fa7dd";
        let shop = await Shop.findById(shopId);
        if (!shop) {
            shop = await Shop.create({
                _id: shopId,
                owner: shopkeeperId,
                name: "Javeria Store",
                description: "Premium ethnic wear, bridal dresses, sarees, and customized tailoring outfits.",
                logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
                banner: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop",
                location: {
                    address: "gsdfsg",
                    city: "fdgdfg",
                    state: "Punjab"
                },
                businessDetails: {
                    ownerName: "Javeria Munawar",
                    phone: "5345345",
                    taxId: ""
                },
                categoryPermissions: ["Wedding", "Party", "Casual", "Formal"],
                profileCompletion: {
                    isComplete: true,
                    percentage: 100,
                    missingFields: []
                },
                isActive: true,
                isVisibleToCustomers: true,
                ratingAvg: 0,
                ratingCount: 0
            });
            console.log("Created Javeria Store shop");
        }

        // 3. Create Sample Products
        const productsData = [
            {
                title: "Women's Leather Handbag",
                description: "Elegant leather handbag with spacious compartments.",
                category: "Accessories",
                tags: ["Handbag", "Leather", "Women"],
                basePrice: 120.0,
                images: ["https://images.unsplash.com/photo-1560347876-aeef00ee7228?auto=format&fit=crop&w=800&q=80"],
                stock: 12,
                isActive: true,
                audience: "WOMEN",
                type: "READY_TO_WEAR",
                shop: shopId
            },
            {
                title: "Men's Formal Suit",
                description: "Classic two-piece suit suitable for business and events.",
                category: "Formal",
                tags: ["Suit", "Formal", "Men"],
                basePrice: 250.0,
                images: ["https://images.unsplash.com/photo-1588611851290-2a2d49d57f02?auto=format&fit=crop&w=800&q=80"],
                stock: 8,
                isActive: true,
                audience: "MEN",
                type: "READY_TO_WEAR",
                shop: shopId
            },
            {
                title: "Unisex Running Shoes",
                description: "Lightweight running shoes designed for comfort across genders.",
                category: "Footwear",
                tags: ["Shoes", "Running", "Unisex"],
                basePrice: 90.0,
                images: ["https://images.unsplash.com/photo-1580773265920-7b5c9848bfe8?auto=format&fit=crop&w=800&q=80"],
                stock: 20,
                isActive: true,
                audience: "UNISEX",
                type: "READY_TO_WEAR",
                shop: shopId
            },
            {
                title: "Floral Summer Dress",
                description: "Lightweight floral dress perfect for summer outings.",
                category: "Casual",
                tags: ["Dress", "Floral", "Women"],
                basePrice: 60.0,
                images: ["https://images.unsplash.com/photo-1520976427272-8c86c3c9e0c9?auto=format&fit=crop&w=800&q=80"],
                stock: 15,
                isActive: true,
                audience: "WOMEN",
                type: "READY_TO_WEAR",
                shop: shopId
            },
            {
                title: "Men's Classic Denim Jacket",
                description: "Durable denim jacket with a timeless silhouette.",
                category: "Casual",
                tags: ["Jacket", "Denim", "Men"],
                basePrice: 85.0,
                images: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"],
                stock: 10,
                isActive: true,
                audience: "MEN",
                type: "READY_TO_WEAR",
                shop: shopId
            },
            {
                title: "Unisex Sports Cap",
                description: "Adjustable cap suitable for all genders.",
                category: "Accessories",
                tags: ["Cap", "Sports", "Unisex"],
                basePrice: 25.0,
                images: ["https://images.unsplash.com/photo-1581349488802-9ccefd2e5efb?auto=format&fit=crop&w=800&q=80"],
                stock: 30,
                isActive: true,
                audience: "UNISEX",
                type: "READY_TO_WEAR",
                shop: shopId
            }
        ];

        const insertedProducts = [];
        for (const prodData of productsData) {
            let existingProduct = await Product.findOne({ title: prodData.title, shop: shopId });
            if (!existingProduct) {
                // Create product in database first
                const product = await Product.create(prodData);

                // Initiate/Sync with Paddle
                try {
                    const paddleResult = await createPaddleProduct({
                        name: product.title,
                        description: product.description || "",
                        price: product.basePrice,
                        currency: "USD",
                        imageUrl: product.images?.[0] || null
                    });

                    if (paddleResult.success) {
                        product.paddleProductId = paddleResult.productId;
                        product.paddlePriceId = paddleResult.priceId;
                        product.paddleSyncStatus = "synced";
                    } else {
                        product.paddleSyncStatus = "failed";
                        product.paddleSyncError = paddleResult.error;
                    }
                    await product.save();
                } catch (paddleErr) {
                    product.paddleSyncStatus = "failed";
                    product.paddleSyncError = paddleErr.message;
                    await product.save();
                }

                insertedProducts.push(product);
            } else {
                insertedProducts.push(existingProduct);
            }
        }

        // 4. Create sample active Tailor
        let tailor = await User.findOne({ email: "tailor@javeria.com" });
        if (!tailor) {
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash("Tailor123!", salt);
            tailor = await User.create({
                email: "tailor@javeria.com",
                passwordHash,
                role: "TAILOR",
                status: "ACTIVE",
                name: "Kamal Ahmed (Expert Tailor)",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
                emailVerified: true,
                profileCompletion: { isComplete: true, percentage: 100 },
                tailorProfile: {
                    location: {
                        address: "Tailoring Street 15",
                        city: "fdgdfg",
                        state: "Punjab"
                    },
                    availability: true,
                    specialization: ["Formal", "Wedding", "Casual"],
                    experience: 12,
                    ratingAvg: 4.8,
                    ratingCount: 15,
                    phone: "+92-300-1234567",
                    pricePerJob: 30,
                    cnicId: "35201-1234567-1",
                    agreedToTerms: true
                }
            });
            console.log("Created tailor tailor@javeria.com");
        }

        // 5. Create sample active Delivery Person
        let deliveryBoy = await User.findOne({ email: "courier@javeria.com" });
        if (!deliveryBoy) {
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash("Courier123!", salt);
            deliveryBoy = await User.create({
                email: "courier@javeria.com",
                passwordHash,
                role: "DELIVERY",
                status: "ACTIVE",
                name: "Raza Ali (Speedy Delivery)",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
                emailVerified: true,
                profileCompletion: { isComplete: true, percentage: 100 },
                deliveryProfile: {
                    fullName: "Raza Ali",
                    phone: "+92-315-7654321",
                    cnicId: "35201-7654321-1",
                    vehicleType: "Bike",
                    licenseNumber: "LHR-87654",
                    serviceAreas: ["fdgdfg", "Lahore"],
                    perDeliveryFee: 8,
                    availability: true,
                    agreedToTerms: true,
                    termsAgreedAt: new Date()
                }
            });
            console.log("Created delivery boy courier@javeria.com");
        }

        return NextResponse.json({
            success: true,
            message: "Database seeded successfully via API",
            shopkeeper: {
                email: "javeria@store.com",
                password: "Javeria123!"
            },
            tailor: {
                email: "tailor@javeria.com",
                password: "Tailor123!"
            },
            deliveryBoy: {
                email: "courier@javeria.com",
                password: "Courier123!"
            },
            shopId: shopId,
            productsSeeded: insertedProducts.map(p => ({ title: p.title, paddleStatus: p.paddleSyncStatus }))
        });

    } catch (error) {
        console.error("API Seeding failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
