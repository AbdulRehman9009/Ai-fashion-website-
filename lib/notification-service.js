/**
 * Notification Service
 * Handles creation and management of user notifications
 */

import { connectDB } from "./db";
import Notification from "@/models/Notification";
import { logger } from "./logger";

/**
 * Create a notification for a user
 * 
 * @param {Object} data - Notification data
 * @param {string} data.userId - User ID to notify
 * @param {string} data.type - Notification type
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} data.priority - Priority level (low, medium, high, urgent)
 * @param {string} data.actionUrl - Optional action URL
 * @param {string} data.actionLabel - Optional action button label
 * @param {Date} data.expiresAt - Optional expiration date
 */
export async function createNotification(data) {
    try {
        await connectDB();

        const notification = await Notification.create({
            user: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            priority: data.priority || 'medium',
            actionUrl: data.actionUrl || null,
            actionLabel: data.actionLabel || null,
            expiresAt: data.expiresAt || null,
            read: false
        });

        logger.info("Notification created", {
            notificationId: notification._id.toString(),
            userId: data.userId,
            type: data.type
        });

        return notification;
    } catch (error) {
        logger.error("Failed to create notification", {
            error: error.message,
            userId: data.userId
        });
        throw error;
    }
}

/**
 * Create multiple notifications for different users
 */
export async function createBulkNotifications(userIds, notificationData) {
    try {
        await connectDB();

        const notifications = userIds.map(userId => ({
            user: userId,
            ...notificationData,
            read: false
        }));

        const created = await Notification.insertMany(notifications);

        logger.info("Bulk notifications created", {
            count: created.length,
            type: notificationData.type
        });

        return created;
    } catch (error) {
        logger.error("Failed to create bulk notifications", {
            error: error.message,
            userCount: userIds.length
        });
        throw error;
    }
}

/**
 * Notification templates for common events
 */
export const NotificationTemplates = {
    orderCreated: (orderId) => ({
        type: 'order',
        title: 'Order Created',
        message: `Your order #${orderId} has been successfully created.`,
        priority: 'medium',
        actionUrl: `/dashboard/user/orders/${orderId}`,
        actionLabel: 'View Order'
    }),

    orderStatusChanged: (orderId, status) => ({
        type: 'order',
        title: 'Order Update',
        message: `Your order #${orderId} status has been updated to ${status}.`,
        priority: 'medium',
        actionUrl: `/dashboard/user/orders/${orderId}`,
        actionLabel: 'View Order'
    }),

    paymentConfirmed: (orderId) => ({
        type: 'payment',
        title: 'Payment Confirmed',
        message: `Payment for order #${orderId} has been confirmed.`,
        priority: 'high',
        actionUrl: `/dashboard/user/orders/${orderId}`,
        actionLabel: 'View Order'
    }),

    tailorAssigned: (orderId, tailorName) => ({
        type: 'order',
        title: 'Tailor Assigned',
        message: `${tailorName} has been assigned to your order #${orderId}.`,
        priority: 'medium',
        actionUrl: `/dashboard/user/orders/${orderId}`,
        actionLabel: 'View Order'
    }),

    newOrderForTailor: (orderId) => ({
        type: 'order',
        title: 'New Tailoring Request',
        message: `You have a new tailoring request for order #${orderId}.`,
        priority: 'high',
        actionUrl: `/dashboard/tailor/orders/${orderId}`,
        actionLabel: 'View Request'
    }),

    deliveryAssigned: (orderId) => ({
        type: 'delivery',
        title: 'New Delivery Assignment',
        message: `You have been assigned to deliver order #${orderId}.`,
        priority: 'high',
        actionUrl: `/dashboard/delivery/orders/${orderId}`,
        actionLabel: 'View Details'
    }),

    profileIncomplete: () => ({
        type: 'system',
        title: 'Complete Your Profile',
        message: 'Please complete your profile to access all features.',
        priority: 'medium',
        actionUrl: '/dashboard/complete-profile',
        actionLabel: 'Complete Profile'
    }),

    emailVerification: () => ({
        type: 'system',
        title: 'Verify Your Email',
        message: 'Please verify your email address to secure your account.',
        priority: 'high',
        actionUrl: '/dashboard/settings',
        actionLabel: 'Verify Email'
    })
};

/**
 * Send notification using template
 */
export async function sendTemplateNotification(userId, templateFn, ...args) {
    const notificationData = templateFn(...args);
    return createNotification({
        userId,
        ...notificationData
    });
}
