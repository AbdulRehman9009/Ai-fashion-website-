/**
 * Custom Error Classes for Application
 * Provides structured error handling with HTTP status codes
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            error: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        };
    }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
    constructor(message = "Validation failed", errors = []) {
        super(message, 400);
        this.errors = errors;
        this.name = "ValidationError";
    }

    toJSON() {
        return {
            error: this.message,
            statusCode: this.statusCode,
            errors: this.errors,
            timestamp: this.timestamp
        };
    }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends AppError {
    constructor(message = "Authentication required") {
        super(message, 401);
        this.name = "AuthenticationError";
    }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends AppError {
    constructor(message = "Access denied") {
        super(message, 403);
        this.name = "AuthorizationError";
    }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
    constructor(resource = "Resource") {
        super(`${resource} not found`, 404);
        this.name = "NotFoundError";
    }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, 409);
        this.name = "ConflictError";
    }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends AppError {
    constructor(message = "Too many requests", retryAfter = 60) {
        super(message, 429);
        this.retryAfter = retryAfter;
        this.name = "RateLimitError";
    }

    toJSON() {
        return {
            ...super.toJSON(),
            retryAfter: this.retryAfter
        };
    }
}

/**
 * External Service Error (502)
 */
export class ExternalServiceError extends AppError {
    constructor(service, message = "External service unavailable") {
        super(`${service}: ${message}`, 502);
        this.service = service;
        this.name = "ExternalServiceError";
    }
}

/**
 * Database Error (500)
 */
export class DatabaseError extends AppError {
    constructor(message = "Database operation failed", originalError = null) {
        super(message, 500);
        this.originalError = originalError;
        this.name = "DatabaseError";
    }
}
