import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { email, token, password } = await req.json();
        await connectDB();

        // 1. Request Reset Link
        if (email && !token) {
            const user = await User.findOne({ email: email.toLowerCase().trim() });
            if (!user) {
                // Return success even if user not found for security
                return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
            }

            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

            user.resetPasswordToken = resetTokenHash;
            user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
            await user.save();

            // In a real app, send email here using SendGrid/Resend
            // For now, we'll log it for the "Simulated" aspect or return it in dev mode if requested, 
            // but adhering to "Simulated" usually implies purely UI flow or logging.
            // I'll return it in the response for this demo so the user can actually test it without email infra.
            console.log(`Reset Token for ${email}: ${resetToken}`);

            return NextResponse.json({
                message: "Reset link sent (Check console for token in dev)",
                // PROD-UNSAFE: returning token for demo purposes only
                debugToken: resetToken
            });
        }

        // 2. Reset Password
        if (token && password) {
            const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

            const user = await User.findOne({
                resetPasswordToken: resetTokenHash,
                resetPasswordExpire: { $gt: Date.now() },
            });

            if (!user) {
                return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
            }

            user.passwordHash = await bcrypt.hash(password, 12);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return NextResponse.json({ message: "Password updated successfully" });
        }

        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
