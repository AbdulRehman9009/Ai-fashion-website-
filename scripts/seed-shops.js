/**
 * Seed Script: Create Sample Shops and Products
 * Run with: node scripts/seed-shops.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const SAMPLE_SHOPS = [
    {
        name: "Elegant Threads",
        description: "Premium designer wear for weddings and special occasions. We specialize in traditional and contemporary fusion outfits.",
        logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
        banner: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop",
        location: {
            address: "123 Fashion Street",
            city: "Mumbai",
            state: "Maharashtra"
        },
        businessDetails: {
            ownerName: "Priya Sharma",
            phone: "+91-9876543210",
            businessType: "Boutique"
        },
        categoryPermissions: ["Wedding", "Party", "Formal"],
        isActive: true,
        isVisibleToCustomers: true
    },
    {
        name: "Royal Fabrics",
        description: "Your one-stop shop for premium fabrics and ready-to-wear ethnic clothing. Quality guaranteed.",
        logo: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop",
        banner: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=400&fit=crop",
        location: {
            address: "456 Textile Market",
            city: "Delhi",
            state: "Delhi"
        },
        businessDetails: {
            ownerName: "Rajesh Kumar",
            phone: "+91-9876543211",
            businessType: "Fabric Store"
        },
        categoryPermissions: ["Casual", "Formal", "Party"],
        isActive: true,
        isVisibleToCustomers: true
    },
    {
        name: "Fashion Hub",
        description: "Modern and trendy outfits for the contemporary fashionista. Latest designs, best prices.",
        logo: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop",
        banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop",
        location: {
            address: "789 Shopping Complex",
            city: "Bangalore",
            state: "Karnataka"
        },
        businessDetails: {
            ownerName: "Anita Desai",
            phone: "+91-9876543212",
            businessType: "Fashion Store"
        },
        categoryPermissions: ["Casual", "Party", "Wedding"],
        isActive: true,
        isVisibleToCustomers: true
    }
];

const SAMPLE_PRODUCTS = [
    // Wedding Category
    {
        title: "Royal Red Bridal Lehenga",
        description: "Stunning red bridal lehenga with intricate gold embroidery. Perfect for your special day.",
        category: "Wedding",
        tags: ["Bridal", "Red", "Embroidered", "Silk"],
        basePrice: 45000,
        images: [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop"
        ],
        stock: 5,
        type: "STITCHED",
        attributes: {
            color: "Red",
            fabric: "Silk",
            pattern: "Embroidered"
        }
    },
    {
        title: "Designer Sherwani Set",
        description: "Elegant cream sherwani with golden embellishments. Includes kurta, pajama, and dupatta.",
        category: "Wedding",
        tags: ["Groom", "Cream", "Embroidered", "Silk"],
        basePrice: 35000,
        images: [
            "https://images.unsplash.com/photo-1622519407650-3df9883f76e5?w=800&h=1000&fit=crop"
        ],
        stock: 8,
        type: "STITCHED",
        attributes: {
            color: "Cream",
            fabric: "Silk",
            pattern: "Embroidered"
        }
    },
    {
        title: "Pink Anarkali Suit",
        description: "Beautiful pink anarkali suit with delicate embroidery. Perfect for wedding functions.",
        category: "Wedding",
        tags: ["Anarkali", "Pink", "Party", "Georgette"],
        basePrice: 12000,
        images: [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop"
        ],
        stock: 12,
        type: "READY_TO_WEAR",
        attributes: {
            color: "Pink",
            fabric: "Georgette",
            pattern: "Embroidered"
        }
    },

    // Party Category
    {
        title: "Black Sequin Saree",
        description: "Glamorous black saree with sequin work. Make a statement at any party.",
        category: "Party",
        tags: ["Saree", "Black", "Sequin", "Party"],
        basePrice: 8500,
        images: [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop"
        ],
        stock: 15,
        type: "READY_TO_WEAR",
        attributes: {
            color: "Black",
            fabric: "Georgette",
            pattern: "Sequin"
        }
    },
    {
        title: "Navy Blue Indo-Western Dress",
        description: "Contemporary indo-western outfit perfect for cocktail parties and celebrations.",
        category: "Party",
        tags: ["Indo-Western", "Blue", "Modern", "Fusion"],
        basePrice: 6500,
        images: [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop"
        ],
        stock: 10,
        type: "READY_TO_WEAR",
        attributes: {
            color: "Navy Blue",
            fabric: "Crepe",
            pattern: "Solid"
        }
    },

    // Casual Category
    {
        title: "Cotton Kurta Set",
        description: "Comfortable cotton kurta with palazzo pants. Perfect for everyday wear.",
        category: "Casual",
        tags: ["Kurta", "Cotton", "Comfortable", "Daily Wear"],
        basePrice: 2500,
        images: [
            "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop"
        ],
        stock: 25,
        type: "READY_TO_WEAR",
        attributes: {
            color: "White",
            fabric: "Cotton",
            pattern: "Printed"
        }
    },
    {
        title: "Denim Kurti",
        description: "Trendy denim kurti with embroidered details. Casual yet stylish.",
        category: "Casual",
        tags: ["Kurti", "Denim", "Casual", "Modern"],
        basePrice: 1800,
        images: [
            "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&h=1000&fit=crop"
        ],
        stock: 30,
        type: "READY_TO_WEAR",
        attributes: {
            color: "Blue",
            fabric: "Denim",
            pattern: "Embroidered"
        }
    },

    // Formal Category
    {
        title: "Formal Blazer Suit",
        description: "Professional blazer suit for corporate events and formal occasions.",
        category: "Formal",
        tags: ["Blazer", "Formal", "Corporate", "Professional"],
        basePrice: 5500,
        images: [
            "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop"
        ],
        stock: 15,
        type: "STITCHED",
        attributes: {
            color: "Black",
            fabric: "Polyester",
            pattern: "Solid"
        }
    },
    {
        title: "Silk Saree - Formal",
        description: "Elegant silk saree suitable for formal events and office parties.",
        category: "Formal",
        tags: ["Saree", "Silk", "Formal", "Elegant"],
        basePrice: 7500,
        images: [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop"
        ],
        stock: 12,
        type: "READY_TO_WEAR",
        attributes: {
            color: "Maroon",
            fabric: "Silk",
            pattern: "Woven"
        }
    },

    // Unstitched Fabrics
    {
        title: "Premium Silk Fabric - 3 Meters",
        description: "High-quality silk fabric for custom tailoring. Get it stitched as per your design.",
        category: "Wedding",
        tags: ["Fabric", "Silk", "Unstitched", "Premium"],
        basePrice: 3500,
        images: [
            "https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=800&h=1000&fit=crop"
        ],
        stock: 50,
        type: "UNSTITCHED",
        attributes: {
            color: "Multi",
            fabric: "Silk",
            pattern: "Printed"
        }
    },
    {
        title: "Cotton Suit Material",
        description: "Comfortable cotton fabric set with dupatta. Perfect for custom stitching.",
        category: "Casual",
        tags: ["Fabric", "Cotton", "Unstitched", "Suit Material"],
        basePrice: 1500,
        images: [
            "https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=800&h=1000&fit=crop"
        ],
        stock: 40,
        type: "UNSTITCHED",
        attributes: {
            color: "Multi",
            fabric: "Cotton",
            pattern: "Printed"
        }
    }
];

async function seedDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Dynamically import models
        const { default: User } = await import('../models/User.js');
        const { default: Shop } = await import('../models/Shop.js');
        const { default: Product } = await import('../models/Product.js');

        // Create shopkeeper users and shops
        console.log('\n📦 Creating shops and shopkeeper accounts...');

        for (let i = 0; i < SAMPLE_SHOPS.length; i++) {
            const shopData = SAMPLE_SHOPS[i];

            // Create shopkeeper user
            const email = `shopkeeper${i + 1}@example.com`;
            const password = 'Password123!';

            // Check if user already exists
            let user = await User.findOne({ email });

            if (!user) {
                const hashedPassword = await bcrypt.hash(password, 10);
                user = await User.create({
                    name: shopData.businessDetails.ownerName,
                    email,
                    password: hashedPassword,
                    role: 'SHOPKEEPER',
                    emailVerified: true,
                    profile: {
                        phone: shopData.businessDetails.phone,
                        isComplete: true
                    }
                });
                console.log(`✅ Created shopkeeper: ${email} (password: ${password})`);
            } else {
                console.log(`ℹ️  Shopkeeper already exists: ${email}`);
            }

            // Check if shop already exists
            let shop = await Shop.findOne({ owner: user._id });

            if (!shop) {
                shop = await Shop.create({
                    ...shopData,
                    owner: user._id,
                    profileCompletion: {
                        isComplete: true,
                        percentage: 100,
                        missingFields: []
                    }
                });
                console.log(`✅ Created shop: ${shopData.name}`);
            } else {
                console.log(`ℹ️  Shop already exists: ${shopData.name}`);
            }

            // Create products for this shop
            const productsPerShop = Math.ceil(SAMPLE_PRODUCTS.length / SAMPLE_SHOPS.length);
            const startIdx = i * productsPerShop;
            const endIdx = Math.min(startIdx + productsPerShop, SAMPLE_PRODUCTS.length);
            const shopProducts = SAMPLE_PRODUCTS.slice(startIdx, endIdx);

            for (const productData of shopProducts) {
                // Check if product already exists
                const existingProduct = await Product.findOne({
                    shop: shop._id,
                    title: productData.title
                });

                if (!existingProduct) {
                    await Product.create({
                        ...productData,
                        shop: shop._id
                    });
                    console.log(`  ✅ Created product: ${productData.title}`);
                } else {
                    console.log(`  ℹ️  Product already exists: ${productData.title}`);
                }
            }
        }

        console.log('\n✨ Database seeded successfully!');
        console.log('\n📝 Shopkeeper Login Credentials:');
        for (let i = 0; i < SAMPLE_SHOPS.length; i++) {
            console.log(`   ${i + 1}. Email: shopkeeper${i + 1}@example.com | Password: Password123!`);
        }
        console.log('\n🎉 You can now browse products as a customer!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the seed script
seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
