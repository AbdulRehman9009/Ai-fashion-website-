import { connectDB } from "../lib/db.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

/**
 * Script to create an admin user
 * Usage: node scripts/createAdmin.js
 */

async function createAdmin() {
    try {
        await connectDB();
        console.log("✅ Connected to database");

        // Admin credentials - CHANGE THESE!
        const adminData = {
            email: "admin@fashionai.com",
            password: "Admin@123456", // Change this to a secure password
            name: "Admin User",
            role: "ADMIN",
            status: "ACTIVE"
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });

        if (existingAdmin) {
            console.log("⚠️  Admin user already exists with email:", adminData.email);
            console.log("Email:", existingAdmin.email);
            console.log("Role:", existingAdmin.role);
            console.log("\nTo reset password, delete this user first or use a different email.");
            process.exit(0);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(adminData.password, 10);

        // Create admin user
        const admin = await User.create({
            email: adminData.email,
            passwordHash,
            name: adminData.name,
            role: adminData.role,
            status: adminData.status
        });

        console.log("\n🎉 Admin user created successfully!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📧 Email:   ", adminData.email);
        console.log("🔑 Password:", adminData.password);
        console.log("👤 Name:    ", adminData.name);
        console.log("🎭 Role:    ", adminData.role);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n⚠️  IMPORTANT: Change the password after first login!");
        console.log("🔗 Login at: http://localhost:3000/auth/admin/login");
        console.log("🏠 Dashboard: http://localhost:3000/dashboard/admin");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating admin user:", error.message);
        process.exit(1);
    }
}

createAdmin();
