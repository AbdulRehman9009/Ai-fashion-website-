import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Profile from "@/models/Profile";
import { signupSchema, validate } from "@/lib/validation/schemas";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { ConflictError, ValidationError } from "@/lib/errors";
import { sanitizeObject } from "@/lib/security";
import { logger } from "@/lib/logger";
import { withErrorHandler } from "@/lib/api-middleware";

/**
 * POST /api/auth/signup
 * Register a new user account
 * 
 * @body {string} email - User email
 * @body {string} password - User password (min 8 chars, must include uppercase, number, special char)
 * @body {string} role - User role (USER, TAILOR, DELIVERY, SHOPKEEPER)
 * @body {string} name - Optional user name
 * 
 * @returns {Object} Created user data
 */
async function signupHandler(req) {
  await connectDB();

  // Parse and sanitize request body
  // Parse and sanitize request body
  const body = await req.json();

  // Sanitize body but keep password intact to avoid HTML entity encoding issues
  const sanitized = {
    ...sanitizeObject(body),
    password: body.password // Preserve original password
  };

  // Validate input
  const validation = validate(signupSchema, sanitized);
  if (!validation.success) {
    logger.warn("Signup validation failed", { errors: validation.errors });
    return validationErrorResponse(validation.errors);
  }

  const { email, password, role, name } = validation.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email is already in use
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();
  if (existingUser) {
    throw new ConflictError("Email address is already registered");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user and related records (without transaction for standalone MongoDB)
  try {
    // Create user
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      role,
      name: name || null,
      emailVerificationToken,
      emailVerificationExpire,
      emailVerified: false,
      status: "ACTIVE"
    });

    // Create profile
    await Profile.create({
      user: user._id,
      name: name || ""
    });

    // Auto-create Shop for SHOPKEEPER role
    if (role === "SHOPKEEPER") {
      const Shop = (await import("@/models/Shop")).default;
      await Shop.create({
        owner: user._id,
        name: name ? `${name}'s Fashion Store` : "My Fashion Store",
        location: {
          city: "Pending Setup",
          address: "Pending Setup",
          state: "Pending Setup"
        },
        isActive: false, // Inactive until profile is completed
        isVisibleToCustomers: false
      });
    }

    // Log successful signup
    logger.info("User signed up successfully", {
      userId: user._id.toString(),
      email: normalizedEmail,
      role
    });

    // Send verification email
    try {
      const { sendVerificationEmail } = await import("@/lib/email");
      await sendVerificationEmail(normalizedEmail, emailVerificationToken, name);
    } catch (emailError) {
      logger.error("Failed to send verification email", { email: normalizedEmail, error: emailError.message });
      // Don't fail signup if email fails
    }

    return successResponse(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        emailVerified: user.emailVerified
      },
      "Account created successfully. Please check your email to verify your account.",
      201
    );
  } catch (error) {
    // If user creation failed due to duplicate email, provide clear error
    if (error.code === 11000) {
      throw new ConflictError("Email address is already registered");
    }
    throw error;
  }
}

export const POST = withErrorHandler(signupHandler);
