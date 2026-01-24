/**
 * Security utilities for the application
 */

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove javascript: protocol
        .replace(/javascript:/gi, '')
        // Remove event handlers
        .replace(/on\w+\s*=/gi, '')
        // Remove data: protocol (except common safe ones)
        .replace(/data:(?!image\/(png|jpg|jpeg|gif|webp|svg))/gi, '')
        // Encode HTML entities
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
export function sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return typeof obj === 'string' ? sanitizeInput(obj) : obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
}

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
export function isValidObjectId(id) {
    if (!id || typeof id !== 'string') return false;
    return /^[a-fA-F0-9]{24}$/.test(id);
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Security headers for API responses
 */
export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/**
 * Add security headers to NextResponse
 * @param {NextResponse} response - The response object
 * @returns {NextResponse} - Response with security headers
 */
export function addSecurityHeaders(response) {
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    return response;
}

/**
 * Validate and parse JSON safely
 * @param {string} jsonString - The JSON string to parse
 * @returns {Object|null} - Parsed object or null if invalid
 */
export function safeJsonParse(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
}
