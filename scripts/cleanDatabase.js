import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("ERROR: MONGODB_URI not found in .env.local");
    process.exit(1);
}

/**
 * Script to clean all dummy/test data from database
 * WARNING: This will delete ALL data except ADMIN users
 * Usage: node scripts/cleanDatabase.js
 */

async function cleanDatabase() {
    try {
        console.log("🌱 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB\n");
        console.log("⚠️  WARNING: This will delete ALL data except ADMIN users!");
        console.log("Starting cleanup...\n");

        // Get database collections directly
        const db = mongoose.connection.db;

        // Delete all orders
        try {
            const ordersResult = await db.collection("orders").deleteMany({});
            console.log(`🗑️  Deleted ${ordersResult.deletedCount} orders`);
        } catch (e) { console.log("ℹ️  No orders collection"); }

        // Delete all deliveries
        try {
            const deliveriesResult = await db.collection("deliveries").deleteMany({});
            console.log(`🗑️  Deleted ${deliveriesResult.deletedCount} deliveries`);
        } catch (e) { console.log("ℹ️  No deliveries collection"); }

        // Delete all products
        try {
            const productsResult = await db.collection("products").deleteMany({});
            console.log(`🗑️  Deleted ${productsResult.deletedCount} products`);
        } catch (e) { console.log("ℹ️  No products collection"); }

        // Delete all shops
        try {
            const shopsResult = await db.collection("shops").deleteMany({});
            console.log(`🗑️  Deleted ${shopsResult.deletedCount} shops`);
        } catch (e) { console.log("ℹ️  No shops collection"); }

        // Delete all carts
        try {
            const cartsResult = await db.collection("carts").deleteMany({});
            console.log(`🗑️  Deleted ${cartsResult.deletedCount} carts`);
        } catch (e) { console.log("ℹ️  No carts collection"); }

        // Delete all non-admin users
        try {
            const usersResult = await db.collection("users").deleteMany({ role: { $ne: "ADMIN" } });
            console.log(`🗑️  Deleted ${usersResult.deletedCount} non-admin users`);
        } catch (e) { console.log("ℹ️  No users collection"); }

        // Count remaining admin users
        const adminCount = await db.collection("users").countDocuments({ role: "ADMIN" });

        console.log(`\n✅ Cleanup complete!`);
        console.log(`📊 Remaining ADMIN users: ${adminCount}`);
        console.log("\n✨ Database is now clean!");

    } catch (error) {
        console.error("❌ Error cleaning database:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n👋 Disconnected from MongoDB");
        process.exit(0);
    }
}

cleanDatabase();
