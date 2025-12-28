import { connectDB } from "../lib/db.js";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Delivery from "../models/Delivery.js";
import AuditLog from "../models/AuditLog.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

/**
 * Script to clean all dummy/test data from database
 * WARNING: This will delete ALL data except ADMIN users
 * Usage: node scripts/cleanDatabase.js
 */

async function cleanDatabase() {
    try {
        await connectDB();
        console.log("✅ Connected to database");
        console.log("\n⚠️  WARNING: This will delete ALL data except ADMIN users!");
        console.log("Starting cleanup in 3 seconds...\n");

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Delete all orders
        const ordersDeleted = await Order.deleteMany({});
        console.log(`🗑️  Deleted ${ordersDeleted.deletedCount} orders`);

        // Delete all deliveries
        const deliveriesDeleted = await Delivery.deleteMany({});
        console.log(`🗑️  Deleted ${deliveriesDeleted.deletedCount} deliveries`);

        // Delete all products
        const productsDeleted = await Product.deleteMany({});
        console.log(`🗑️  Deleted ${productsDeleted.deletedCount} products`);

        // Delete all shops
        const shopsDeleted = await Shop.deleteMany({});
        console.log(`🗑️  Deleted ${shopsDeleted.deletedCount} shops`);

        // Delete all non-admin users
        const usersDeleted = await User.deleteMany({ role: { $ne: "ADMIN" } });
        console.log(`🗑️  Deleted ${usersDeleted.deletedCount} non-admin users`);

        // Optional: Clear audit logs (uncomment if needed)
        // const auditDeleted = await AuditLog.deleteMany({});
        // console.log(`🗑️  Deleted ${auditDeleted.deletedCount} audit logs`);

        // Count remaining admin users
        const adminCount = await User.countDocuments({ role: "ADMIN" });
        console.log(`\n✅ Cleanup complete!`);
        console.log(`📊 Remaining ADMIN users: ${adminCount}`);

        if (adminCount === 0) {
            console.log("\n⚠️  WARNING: No admin users found! Run 'node scripts/createAdmin.js' to create one.");
        }

        console.log("\n✨ Database is now clean and ready for production data!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error cleaning database:", error.message);
        process.exit(1);
    }
}

cleanDatabase();
