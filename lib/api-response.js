
import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { logger } from "./logger";

export function successResponse(data, message = null, statusCode = 200) {
    const response = {
        success: true,
        ...(message && { message }),
        data
    };

    return NextResponse.json(response, { status: statusCode });
}

export function paginatedResponse(data, pagination) {
    return NextResponse.json({
        success: true,
        data,
        pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 20,
            total: pagination.total || 0,
            totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 20))
        }
    });
}

export function errorResponse(error, additionalContext = {}) {
    logger.error(error.message, {
        name: error.name,
        stack: error.stack,
        ...additionalContext,
        ...(error.originalError && { originalError: error.originalError.message })
    });

    if (error instanceof AppError) {
        return NextResponse.json(error.toJSON(), {
            status: error.statusCode,
            ...(error.retryAfter && { headers: { 'Retry-After': error.retryAfter } })
        });
    }

    if (error.name === 'ValidationError' && error.errors) {
        const validationErrors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
        }));

        return NextResponse.json({
            error: "Validation failed",
            statusCode: 400,
            errors: validationErrors,
            timestamp: new Date().toISOString()
        }, { status: 400 });
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        return NextResponse.json({
            error: `Duplicate value for field: ${field}`,
            statusCode: 409,
            timestamp: new Date().toISOString()
        }, { status: 409 });
    }

    if (error.name === 'CastError') {
        return NextResponse.json({
            error: `Invalid ${error.path}: ${error.value}`,
            statusCode: 400,
            timestamp: new Date().toISOString()
        }, { status: 400 });
    }

    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json({
        error: isDevelopment ? error.message : "Internal server error",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        ...(isDevelopment && { stack: error.stack })
    }, { status: 500 });
}

/**
 * Validation error response
 * @param {Array} errors - Array of validation errors
 */
export function validationErrorResponse(errors) {
    return NextResponse.json({
        error: "Validation failed",
        statusCode: 400,
        errors: errors,
        timestamp: new Date().toISOString()
    }, { status: 400 });
}

/**
 * Created response for new resources
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
export function createdResponse(data, message = "Resource created successfully") {
    return successResponse(data, message, 201);
}

/**
 * No content response (typically for DELETE)
 */
export function noContentResponse() {
    return new NextResponse(null, { status: 204 });
}
