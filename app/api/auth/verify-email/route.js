import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/**
 * GET /api/auth/verify-email?token=xxx
 * Verify user's email address
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Verification token is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Find user with valid token
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpire: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired verification link" },
                { status: 400 }
            );
        }

        // Update user
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        // Redirect to success page
        return NextResponse.redirect(
            new URL("/auth/email-verified", req.url)
        );

    } catch (error) {
        console.error("Email verification error:", error);
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/auth/verify-email
 * Resend verification email
 */
export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists
            return NextResponse.json({
                message: "If this email exists, a verification link has been sent"
            });
        }

        if (user.emailVerified) {
            return NextResponse.json({
                message: "Email is already verified"
            });
        }

        // Generate new token
        const crypto = await import("crypto");
        const token = crypto.randomBytes(32).toString("hex");

        user.emailVerificationToken = token;
        user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        // Send email
        const { sendVerificationEmail } = await import("@/lib/email");
        await sendVerificationEmail(user.email, token, user.name);

        return NextResponse.json({
            message: "Verification email sent"
        });

    } catch (error) {
        console.error("Resend verification error:", error);
        return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 }
        );
    }
}
