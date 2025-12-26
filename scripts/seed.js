import { connectDB } from "../lib/db.js";
import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Delivery from "../models/Delivery.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const PRODUCTS = [
    {
        title: "Royal Blue Silk Saree",
        description: "A magnificent royal blue saree with golden zari border suitable for weddings. Handwoven with premium silk threads.",
        category: "Saree",
        tags: ["Wedding", "Silk", "Blue", "Traditional", "Royal"],
        basePrice: 150,
        type: "READY_TO_WEAR",
        attributes: { color: "Blue", fabric: "Silk" },
        imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
    },
    {
        title: "Black Slim Fit Tuxedo",
        description: "Classic black tuxedo for formal evening events. Features a satin shawl collar and tailored fit.",
        category: "Suit",
        tags: ["Formal", "Black", "Men", "Party", "Evening"],
        basePrice: 200,
        type: "STITCHED",
        attributes: { color: "Black", fabric: "Wool" },
        imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c47e356?w=800&q=80"
    },
    {
        title: "Red Velvet Party Gown",
        description: "Stunning red velvet gown with off-shoulder design. Perfect for galas and red carpet events.",
        category: "Gown",
        tags: ["Party", "Red", "Western", "Evening", "Elegant"],
        basePrice: 120,
        type: "READY_TO_WEAR",
        attributes: { color: "Red", fabric: "Velvet" },
        imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80"
    },
    {
        title: "Pastel Pink Lehenga",
        description: "Soft pastel pink lehenga with floral embroidery, perfect for day weddings and sangeet ceremonies.",
        category: "Lehenga",
        tags: ["Wedding", "Pink", "Pastel", "Floral", "Bridal"],
        basePrice: 250,
        type: "UNSTITCHED",
        attributes: { color: "Pink", fabric: "Georgette" },
        imageUrl: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80"
    },
    {
        title: "Navy Blue Linen Shirt",
        description: "Casual navy blue linen shirt for summer outings. Breathable fabric with a relaxed fit.",
        category: "Shirt",
        tags: ["Casual", "Blue", "Summer", "Men", "Comfort"],
        basePrice: 45,
        type: "READY_TO_WEAR",
        attributes: { color: "Navy", fabric: "Linen" },
        imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"
    },
    {
        title: "Floral Summer Dress",
        description: "Light and breezy floral dress for casual day outs. Features a sweetheart neckline.",
        category: "Dress",
        tags: ["Casual", "Floral", "Summer", "Women", "Day"],
        basePrice: 65,
        type: "READY_TO_WEAR",
        attributes: { color: "Multicolor", fabric: "Cotton" },
        imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80"
    },
    {
        title: "Beige Trench Coat",
        description: "Timeless beige trench coat. Water-resistant and perfect for transitional weather.",
        category: "Outerwear",
        tags: ["Formal", "Beige", "Winter", "Unisex", "Classic"],
        basePrice: 180,
        type: "READY_TO_WEAR",
        attributes: { color: "Beige", fabric: "Cotton Gabardine" },
        imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"
    },
    {
        title: "White Sneakers",
        description: "Minimalist white leather sneakers. Versatile enough to pair with any outfit.",
        category: "Footwear",
        tags: ["Casual", "White", "Shoes", "Unisex", "Minimal"],
        basePrice: 90,
        type: "READY_TO_WEAR",
        attributes: { color: "White", fabric: "Leather" },
        imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80"
    }
];

async function seed() {
  await connectDB();
  console.log("Connected to DB");

  // Clear existing data (optional, but good for clean slate if needed. Be careful in prod)
  // await Product.deleteMany({});
  // await Order.deleteMany({});
  // await User.deleteMany({});
  // await Shop.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Users for each role
  const roles = ["USER", "TAILOR", "DELIVERY", "SHOPKEEPER", "ADMIN"];
  const users = {};

  for (const role of roles) {
      const email = `${role.toLowerCase()}@example.com`;
      let user = await User.findOne({ email });
      if (!user) {
          user = await User.create({
              email,
              passwordHash,
              role,
              status: "ACTIVE"
          });
          console.log(`Created ${role}: ${email}`);
      }
      users[role] = user;
  }

  // 2. Create Shop
  let shop = await Shop.findOne({ owner: users["SHOPKEEPER"]._id });
  if (!shop) {
      shop = await Shop.create({
          owner: users["SHOPKEEPER"]._id,
          name: "Elegant Threads",
          location: { city: "New York", coordinates: [-74.006, 40.7128] }
      });
      console.log("Created Shop");
  }

  // 3. Upsert Products (avoid duplicates)
  const productDocs = [];
  for (const p of PRODUCTS) {
      let product = await Product.findOne({ title: p.title });
      if (!product) {
          product = await Product.create({ ...p, shop: shop._id });
          console.log(`Created Product: ${p.title}`);
      }
      productDocs.push(product);
  }

  // 4. Create Sample Orders
  // We'll create a few orders in different states
  const orderStates = [
      { status: "PaymentPending", paymentStatus: "PENDING" },
      { status: "TailoringPending", paymentStatus: "PAID", tailoring: true },
      { status: "DeliveryPending", paymentStatus: "PAID" },
      { status: "Completed", paymentStatus: "PAID" }
  ];

  for (let i = 0; i < orderStates.length; i++) {
      const state = orderStates[i];
      const product = productDocs[i % productDocs.length];
      
      const pricing = {
          itemsTotal: product.basePrice,
          tailoringTotal: state.tailoring ? 25 : 0,
          deliveryFee: 15,
          urgentFee: 0,
          grandTotal: product.basePrice + (state.tailoring ? 25 : 0) + 15
      };

      const orderData = {
          user: users["USER"]._id,
          shop: shop._id,
          items: [{ 
              product: product._id, 
              quantity: 1, 
              unitPrice: product.basePrice,
              totalPrice: product.basePrice 
          }],
          tailoringRequests: state.tailoring ? [{ name: "Alteration", price: 25 }] : [],
          pricing,
          status: state.status,
          paymentStatus: state.paymentStatus
      };

      // Check if similar order exists to avoid spamming on re-runs
      const existingOrder = await Order.findOne({ user: users["USER"]._id, status: state.status, "items.product": product._id });
      if (!existingOrder) {
          await Order.create(orderData);
          console.log(`Created Order with status: ${state.status}`);
      }
  }

  console.log("Seeding completed successfully");
  process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
