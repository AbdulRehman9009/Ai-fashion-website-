/**
 * API Middleware Utilities
 * Composable middleware for API routes
 */

import { getToken } from "next-auth/jwt";
import { errorResponse, validationErrorResponse } from "./api-response";
import { AuthenticationError, AuthorizationError } from "./errors";
import { logger, createTimer } from "./logger";
import { sanitizeObject } from "./security";
import { validate } from "./validation/schemas";

/**
 * Higher-order function that wraps API route with error handling
 * @param {Function} handler - Route handler function
 * @returns {Function} Wrapped handler
 */
export function withErrorHandler(handler) {
    return async (req, context) => {
        const timer = createTimer();
        const method = req.method;
        const path = req.nextUrl?.pathname || req.url;

        try {
            const result = await handler(req, context);
            const duration = timer();

            // Log successful request
            logger.request(method, path, result.status, duration);

            return result;
        } catch (error) {
            const duration = timer();

            // Log error with context
            logger.error(`API Error: ${method} ${path}`, {
                error: error.message,
                stack: error.stack,
                duration
            });

            return errorResponse(error, { method, path, duration });
        }
    };
}

/**
 * Middleware to validate request body against Zod schema
 * @param {Function} handler - Route handler
 * @param {z.ZodSchema} schema - Zod validation schema
 * @returns {Function} Wrapped handler
 */
export function withValidation(handler, schema) {
    return async (req, context) => {
        try {
            const body = await req.json();
            const sanitized = sanitizeObject(body);
            const validation = validate(schema, sanitized);

            if (!validation.success) {
                return validationErrorResponse(validation.errors);
            }

            // Attach validated data to request for handler to use
            req.validatedData = validation.data;

            return await handler(req, context);
        } catch (error) {
            if (error instanceof SyntaxError) {
                return validationErrorResponse([{ field: 'body', message: 'Invalid JSON format' }]);
            }
            throw error;
        }
    };
}

/**
 * Middleware to check authentication
 * @param {Function} handler - Route handler
 * @param {Object} options - Options for auth middleware
 * @returns {Function} Wrapped handler
 */
export function withAuth(handler, options = {}) {
    const { roles = null } = options;

    return async (req, context) => {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token) {
            throw new AuthenticationError("Please log in to access this resource");
        }

        // Check role-based access
        if (roles && !roles.includes(token.role)) {
            throw new AuthorizationError(`Access restricted to: ${roles.join(', ')}`);
        }

        // Attach user info to request
        req.user = {
            id: token.sub,
            email: token.email,
            role: token.role,
            isProfileComplete: token.isProfileComplete
        };

        return await handler(req, context);
    };
}

/**
 * Middleware to enforce profile completion
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function withProfileCompletion(handler) {
    return async (req, context) => {
        if (req.user && !req.user.isProfileComplete) {
            throw new AuthorizationError("Please complete your profile to access this resource");
        }
        return await handler(req, context);
    };
}

/**
 * Compose multiple middleware functions
 * @param {...Function} middlewares - Middleware functions to compose
 * @returns {Function} Composed middleware
 */
export function composeMiddleware(...middlewares) {
    return (handler) => {
        return middlewares.reduceRight(
            (wrappedHandler, middleware) => middleware(wrappedHandler),
            handler
        );
    };
}

/**
 * Example usage:
 * 
 * export const POST = composeMiddleware(
 *   withErrorHandler,
 *   (handler) => withAuth(handler, { roles: ['SHOPKEEPER'] }),
 *   (handler) => withValidation(handler, createProductSchema)
 * )(async (req) => {
 *   const data = req.validatedData;
 *   const userId = req.user.id;
 *   // ... handle request
 * });
 */
