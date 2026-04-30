#!/usr/bin/env node

/**
 * Script: scripts/addProductsToShop.js
 * Usage: MONGODB_URI="..." node scripts/addProductsToShop.js
 *
 * Creates sample products for an existing shop. Edit the SHOP_ID constant below
 * or pass SHOP_ID as an env var.
 */

import dotenv from "dotenv";
dotenv.config();

import { connectDB, disconnectDB } from "../lib/db";
import Product from "../models/Product";

const SHOP_ID = process.env.SHOP_ID || "69f3553ed1a1cfedcd854840";

async function main() {
  try {
    await connectDB();

    const now = new Date();

    const products = [
      {
        shop: SHOP_ID,
        title: "Classic Cotton Kurta",
        description: "Breathable cotton kurta in solid colors — perfect for everyday wear.",
        category: "Kurta",
        tags: ["Cotton", "Casual", "Unstitched"],
        basePrice: 29.99,
        images: ["/images/products/kurta1.jpg"],
        stock: 50,
        isActive: true,
        type: "READY_TO_WEAR",
        createdAt: now,
        updatedAt: now
      },
      {
        shop: SHOP_ID,
        title: "Elegant Silk Saree",
        description: "Hand-finished silk saree with subtle zari detailing for festive occasions.",
        category: "Saree",
        tags: ["Silk", "Festive", "Handcrafted"],
        basePrice: 149.99,
        images: ["/images/products/saree1.jpg"],
        stock: 20,
        isActive: true,
        type: "READY_TO_WEAR",
        createdAt: now,
        updatedAt: now
      },
      {
        shop: SHOP_ID,
        title: "Tailored Men's Suit",
        description: "Premium two-piece suit fabric with option for tailoring to fit.",
        category: "Suit",
        tags: ["Wool", "Formal", "Tailoring"],
        basePrice: 249.0,
        images: ["/images/products/suit1.jpg"],
        stock: 10,
        isActive: true,
        type: "STITCHED",
        createdAt: now,
        updatedAt: now
      },
      {
        shop: SHOP_ID,
        title: "Printed Chiffon Dress",
        description: "Lightweight chiffon dress with floral prints. Comes in multiple sizes.",
        category: "Dress",
        tags: ["Chiffon", "Party", "Printed"],
        basePrice: 79.99,
        images: ["/images/products/dress1.jpg"],
        stock: 35,
        isActive: true,
        type: "READY_TO_WEAR",
        createdAt: now,
        updatedAt: now
      },
      {
        shop: SHOP_ID,
        title: "Handloom Cotton Fabric (per meter)",
        description: "High-quality handloom cotton fabric sold per meter for custom tailoring.",
        category: "Fabric",
        tags: ["Fabric", "Cotton", "Handloom"],
        basePrice: 9.99,
        images: ["/images/products/fabric1.jpg"],
        stock: 500,
        isActive: true,
        type: "UNSTITCHED",
        createdAt: now,
        updatedAt: now
      }
    ];

    const result = await Product.insertMany(products, { ordered: true });

    console.log(`Inserted ${result.length} products for shop ${SHOP_ID}`);
    result.forEach((p) => console.log(` - ${p._id} : ${p.title}`));
  } catch (error) {
    console.error("Error inserting products:", error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
