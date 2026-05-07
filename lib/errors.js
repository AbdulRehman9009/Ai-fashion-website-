 
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

 
export class AuthenticationError extends AppError {
    constructor(message = "Authentication required") {
        super(message, 401);
        this.name = "AuthenticationError";
    }
}

 
export class AuthorizationError extends AppError {
    constructor(message = "Access denied") {
        super(message, 403);
        this.name = "AuthorizationError";
    }
}

 
export class NotFoundError extends AppError {
    constructor(resource = "Resource") {
        super(`${resource} not found`, 404);
        this.name = "NotFoundError";
    }
}

 
export class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, 409);
        this.name = "ConflictError";
    }
}

 
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

 
export class ExternalServiceError extends AppError {
    constructor(service, message = "External service unavailable") {
        super(`${service}: ${message}`, 502);
        this.service = service;
        this.name = "ExternalServiceError";
    }
}

 
export class DatabaseError extends AppError {
    constructor(message = "Database operation failed", originalError = null) {
        super(message, 500);
        this.originalError = originalError;
        this.name = "DatabaseError";
    }
}
