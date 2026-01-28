import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Shop from "@/models/Shop";
import Profile from "@/models/Profile";
import Order from "@/models/Order";
import Product from "@/models/Product";
import bcrypt from "bcryptjs";

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { password, confirmText } = body;

        // Validate confirmation text
        if (confirmText !== "DELETE MY ACCOUNT") {
            return NextResponse.json(
                { error: "Please type 'DELETE MY ACCOUNT' to confirm" },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify user exists and password is correct
        const user = await User.findById(session.user.id).select("+password");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
        }

        // Delete role-specific data
        const role = user.role;

        if (role === "SHOPKEEPER") {
            // Delete shop and associated products
            const shop = await Shop.findOne({ owner: user._id });
            if (shop) {
                await Product.deleteMany({ shop: shop._id });
                await Shop.findByIdAndDelete(shop._id);
            }
        }

        if (role === "USER") {
            // Delete user profile
            await Profile.findOneAndDelete({ user: user._id });
        }

        // Note: Orders are kept for record-keeping but anonymized
        await Order.updateMany(
            { user: user._id },
            {
                $set: {
                    userDeleted: true,
                    userName: "Deleted User"
                }
            }
        );

        // Delete the user
        await User.findByIdAndDelete(user._id);

        return NextResponse.json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting account:", error);
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        );
    }
}
