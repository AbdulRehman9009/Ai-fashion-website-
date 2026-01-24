/**
 * Audit Logging Utility
 * Creates audit trail for sensitive operations
 */

import { connectDB } from "./db";
import AuditLog from "@/models/AuditLog";
import { logger } from "./logger";

/**
 * Log an audit event
 * 
 * @param {Object} data - Audit log data
 * @param {string} data.action - Action performed (e.g., "USER_CREATED", "ORDER_UPDATED")
 * @param {string} data.userId - ID of user who performed the action
 * @param {string} data.resource - Resource type (e.g., "User", "Order", "Product")
 * @param {string} data.resourceId - ID of the resource affected
 * @param {Object} data.metadata - Additional metadata
 * @param {Object} req - Request object (optional, for extracting IP and user agent)
 */
export async function createAuditLog(data, req = null) {
    try {
        await connectDB();

        const auditData = {
            action: data.action,
            user: data.userId || null,
            resource: data.resource,
            resourceId: data.resourceId || null,
            metadata: data.metadata || {},
            ipAddress: req ? getClientIp(req) : null,
            userAgent: req?.headers?.get('user-agent') || null,
            timestamp: new Date()
        };

        const auditLog = await AuditLog.create(auditData);

        logger.info("Audit log created", {
            action: data.action,
            resource: data.resource,
            userId: data.userId
        });

        return auditLog;
    } catch (error) {
        // Don't throw errors for audit logging failures
        // Just log them and continue
        logger.error("Failed to create audit log", {
            error: error.message,
            action: data.action
        });
        return null;
    }
}

/**
 * Get client IP address from request
 */
function getClientIp(req) {
    const forwarded = req.headers?.get('x-forwarded-for');
    const realIp = req.headers?.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    return 'unknown';
}

/**
 * Common audit actions
 */
export const AUDIT_ACTIONS = {
    // User actions
    USER_CREATED: 'USER_CREATED',
    USER_UPDATED: 'USER_UPDATED',
    USER_DELETED: 'USER_DELETED',
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
    USER_PASSWORD_CHANGED: 'USER_PASSWORD_CHANGED',
    USER_EMAIL_VERIFIED: 'USER_EMAIL_VERIFIED',

    // Product actions
    PRODUCT_CREATED: 'PRODUCT_CREATED',
    PRODUCT_UPDATED: 'PRODUCT_UPDATED',
    PRODUCT_DELETED: 'PRODUCT_DELETED',

    // Order actions
    ORDER_CREATED: 'ORDER_CREATED',
    ORDER_UPDATED: 'ORDER_UPDATED',
    ORDER_CANCELED: 'ORDER_CANCELED',
    ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',

    // Payment actions
    PAYMENT_INITIATED: 'PAYMENT_INITIATED',
    PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
    PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',

    // Admin actions
    ADMIN_CONFIG_CHANGED: 'ADMIN_CONFIG_CHANGED',
    ADMIN_USER_SUSPENDED: 'ADMIN_USER_SUSPENDED',
    ADMIN_USER_ACTIVATED: 'ADMIN_USER_ACTIVATED',
    ADMIN_PAYOUT_RELEASED: 'ADMIN_PAYOUT_RELEASED',
};

/**
 * Helper function to log user creation
 */
export async function logUserCreated(userId, email, role, req = null) {
    return createAuditLog({
        action: AUDIT_ACTIONS.USER_CREATED,
        userId: userId,
        resource: 'User',
        resourceId: userId,
        metadata: { email, role }
    }, req);
}

/**
 * Helper function to log user login
 */
export async function logUserLogin(userId, email, req = null) {
    return createAuditLog({
        action: AUDIT_ACTIONS.USER_LOGIN,
        userId: userId,
        resource: 'User',
        resourceId: userId,
        metadata: { email, timestamp: new Date() }
    }, req);
}

/**
 * Helper function to log order status change
 */
export async function logOrderStatusChange(orderId, userId, oldStatus, newStatus, req = null) {
    return createAuditLog({
        action: AUDIT_ACTIONS.ORDER_STATUS_CHANGED,
        userId: userId,
        resource: 'Order',
        resourceId: orderId,
        metadata: { oldStatus, newStatus }
    }, req);
}
