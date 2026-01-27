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

// User Schema (inline for standalone script)
const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String },
        role: { type: String, enum: ["USER", "TAILOR", "DELIVERY", "SHOPKEEPER", "ADMIN"], default: "USER" },
        status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
        name: { type: String },
        emailVerified: { type: Boolean, default: false },
        profileCompletion: {
            isComplete: { type: Boolean, default: false },
            percentage: { type: Number, default: 0 },
        },
        adminProfile: {
            canAccessAuditLogs: { type: Boolean, default: true },
            lastPasswordChange: Date,
        },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
    try {
        console.log("🌱 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Admin credentials
        const adminEmail = "admin@aifashion.com";
        const adminPassword = "Admin123!";

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("⚠️  Admin user already exists:", adminEmail);
            console.log("   Role:", existingAdmin.role);
        } else {
            // Hash password
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(adminPassword, salt);

            // Create admin user
            const admin = await User.create({
                email: adminEmail,
                passwordHash,
                role: "ADMIN",
                status: "ACTIVE",
                name: "System Admin",
                emailVerified: true,
                profileCompletion: {
                    isComplete: true,
                    percentage: 100,
                },
                adminProfile: {
                    canAccessAuditLogs: true,
                    lastPasswordChange: new Date(),
                },
            });

            console.log("✅ Admin user created successfully!");
            console.log("   Email:", adminEmail);
            console.log("   Password:", adminPassword);
            console.log("   Role:", admin.role);
        }

        // Also create sample users for testing (optional)
        const sampleUsers = [
            { email: "tailor@test.com", role: "TAILOR", name: "Test Tailor" },
            { email: "delivery@test.com", role: "DELIVERY", name: "Test Delivery" },
            { email: "shop@test.com", role: "SHOPKEEPER", name: "Test Shopkeeper" },
        ];

        for (const userData of sampleUsers) {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                const salt = await bcrypt.genSalt(12);
                const passwordHash = await bcrypt.hash("Test123!", salt);
                await User.create({
                    ...userData,
                    passwordHash,
                    status: "ACTIVE",
                    emailVerified: true,
                    profileCompletion: { isComplete: true, percentage: 100 },
                });
                console.log(`✅ Created test user: ${userData.email} (${userData.role})`);
            }
        }

        console.log("\n🎉 Seeding complete!");
        console.log("\n📋 Admin Login Credentials:");
        console.log("   URL: http://localhost:3000/auth/admin/login");
        console.log("   Email: admin@aifashion.com");
        console.log("   Password: Admin123!");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n👋 Disconnected from MongoDB");
        process.exit(0);
    }
}

seedAdmin();
