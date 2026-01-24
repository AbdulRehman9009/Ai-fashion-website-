/**
 * Zod Validation Schemas for API Requests
 * Provides type-safe validation for all API endpoints
 */

import { z } from "zod";

/**
 * Common field validators
 */
const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ID format");

const emailSchema = z.string()
    .email("Invalid email format")
    .toLowerCase()
    .trim();

const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * User / Authentication Schemas
 */
export const signupSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(["USER", "TAILOR", "DELIVERY", "SHOPKEEPER"], {
        errorMap: () => ({ message: "Invalid role" })
    }).default("USER"),
    name: z.string().min(2, "Name must be at least 2 characters").optional()
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required")
});

export const resetPasswordSchema = z.object({
    email: emailSchema
});

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema
});

/**
 * Profile Schemas
 */
export const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    image: z.string().url().optional(),
});

export const customerProfileSchema = z.object({
    measurementPreference: z.enum(["manual", "tailor"]).optional(),
    defaultPaymentMethod: z.string().optional(),
    agreedToTerms: z.boolean().optional()
});

export const tailorProfileSchema = z.object({
    location: z.object({
        address: z.string().min(5),
        city: z.string().min(2),
        state: z.string().min(2),
        coordinates: z.array(z.number()).length(2).optional()
    }).optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    cnicId: z.string().min(10, "Invalid CNIC ID"),
    specialization: z.array(z.string()).min(1, "At least one specialization required"),
    experience: z.number().min(0).max(50),
    pricePerJob: z.number().min(0),
    agreedToTerms: z.boolean().refine(val => val === true, "Must agree to terms")
});

export const deliveryProfileSchema = z.object({
    fullName: z.string().min(2),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    cnicId: z.string().min(10, "Invalid CNIC ID"),
    vehicleType: z.enum(["Bike", "Car", "Van", "Truck"]),
    licenseNumber: z.string().min(5),
    serviceAreas: z.array(z.string()).min(1, "At least one service area required"),
    perDeliveryFee: z.number().min(0).optional(),
    agreedToTerms: z.boolean().refine(val => val === true, "Must agree to terms")
});

export const shopkeeperProfileSchema = z.object({
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    businessName: z.string().min(2),
    businessAddress: z.string().min(5),
    agreedToTerms: z.boolean().refine(val => val === true, "Must agree to terms")
});

/**
 * Product Schemas
 */
export const createProductSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z.string().max(2000).optional(),
    category: z.string().min(2, "Category is required"),
    tags: z.array(z.string()).optional().default([]),
    basePrice: z.coerce.number().min(0, "Price must be positive"),
    images: z.array(z.string()).optional().default([]).transform(arr => arr.filter(s => s && s.trim())),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
    type: z.enum(["STITCHED", "UNSTITCHED", "READY_TO_WEAR"]).default("READY_TO_WEAR"),
    attributes: z.object({
        color: z.string().optional(),
        fabric: z.string().optional(),
        pattern: z.string().optional()
    }).optional()
});

export const updateProductSchema = createProductSchema.partial().extend({
    _id: objectIdSchema
});

/**
 * Order Schemas
 */
export const orderItemSchema = z.object({
    productId: objectIdSchema,
    quantity: z.number().int().min(1, "Quantity must be at least 1").max(100, "Quantity too large")
});

export const tailoringRequestSchema = z.object({
    name: z.string().min(2),
    price: z.number().min(0).optional(),
    notes: z.string().max(500).optional()
});

export const shippingAddressSchema = z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zip: z.string().min(3),
    country: z.string().min(2).default("Pakistan")
});

export const createOrderSchema = z.object({
    shopId: objectIdSchema,
    items: z.array(orderItemSchema).min(1, "At least one item required"),
    tailoringRequests: z.array(tailoringRequestSchema).optional().default([]),
    urgent: z.boolean().default(false),
    deliveryZone: z.string().default("standard"),
    shippingAddress: shippingAddressSchema
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "OrderCreated",
        "PaymentPending",
        "PaymentConfirmed",
        "TailoringPending",
        "TailoringInProgress",
        "TailoringCompleted",
        "DeliveryPending",
        "OutForPickup",
        "PickedUp",
        "OutForDelivery",
        "Delivered",
        "Completed",
        "Canceled"
    ]),
    notes: z.string().max(500).optional()
});

/**
 * Shop Schemas
 */
export const createShopSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(1000).optional(),
    logo: z.string().url().optional(),
    location: z.object({
        address: z.string().min(5),
        city: z.string().min(2),
        state: z.string().min(2),
        coordinates: z.array(z.number()).length(2).optional()
    }),
    contactInfo: z.object({
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
        email: emailSchema.optional(),
        website: z.string().url().optional()
    })
});

/**
 * Query Parameter Schemas
 */
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const productQuerySchema = paginationSchema.extend({
    category: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    type: z.enum(["STITCHED", "UNSTITCHED", "READY_TO_WEAR"]).optional(),
    search: z.string().optional(),
    sort: z.enum(["price_asc", "price_desc", "newest", "oldest"]).default("newest")
});

export const orderQuerySchema = paginationSchema.extend({
    status: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional()
});

// ...existing code...
/**
 * Helper function to validate and parse data
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {*} data - Data to validate
 * @returns {Object} { success, data, errors }
 */
export function validate(schema, data) {
    // Handle null/undefined data - filter out null/empty values from objects
    // This is critical for handling searchParams.get() which returns null for missing params
    let cleanData = {};

    if (data && typeof data === 'object' && !Array.isArray(data)) {
        for (const [key, value] of Object.entries(data)) {
            // Skip null, undefined, and empty strings
            if (value !== null && value !== undefined && value !== '') {
                cleanData[key] = value;
            }
        }
    } else if (data !== null && data !== undefined) {
        cleanData = data;
    }

    const result = schema.safeParse(cleanData);

    if (result.success) {
        return { success: true, data: result.data, errors: null };
    } else {
        // Extract Zod validation errors
        const errorList = result.error?.issues || result.error?.errors || [];

        const errors = errorList.map(err => {
            const fieldPath = Array.isArray(err.path) ? err.path.join('.') : String(err.path || 'unknown');
            return {
                field: fieldPath,
                message: err.message || 'Validation error'
            };
        });

        // Fallback if no errors were mapped
        if (errors.length === 0) {
            errors.push({
                field: 'unknown',
                message: result.error?.message || "Validation failed"
            });
        }

        return { success: false, data: null, errors };
    }
}
