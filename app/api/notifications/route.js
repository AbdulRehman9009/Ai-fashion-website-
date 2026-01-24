/**
 * Notifications API Endpoint
 * Manages user notifications
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { withErrorHandler, withAuth } from "@/lib/api-middleware";
import { successResponse, paginatedResponse } from "@/lib/api-response";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { paginationSchema, validate } from "@/lib/validation/schemas";

/**
 * GET /api/notifications
 * Get user's notifications with pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} unreadOnly - Filter to unread notifications
 */
async function getNotifications(req) {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Validate pagination
    const paginationValidation = validate(paginationSchema, {
        page: searchParams.get('page'),
        limit: searchParams.get('limit')
    });

    if (!paginationValidation.success) {
        throw new ValidationError("Invalid pagination parameters", paginationValidation.errors);
    }

    const { page, limit } = paginationValidation.data;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: req.user.id };
    if (unreadOnly) {
        query.read = false;
    }

    // Remove expired notifications
    query.$or = [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
    ];

    const [notifications, total] = await Promise.all([
        Notification.find(query)
            .sort({ createdAt: -1, priority: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Notification.countDocuments(query)
    ]);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
        user: req.user.id,
        read: false,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });

    return NextResponse.json({
        success: true,
        data: notifications,
        unreadCount,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
}

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
 */
async function markAsRead(req) {
    await connectDB();

    const body = await req.json();
    const { id, markAll } = body;

    if (markAll) {
        // Mark all notifications as read
        await Notification.updateMany(
            { user: req.user.id, read: false },
            { $set: { read: true, readAt: new Date() } }
        );

        return successResponse(
            { updated: true },
            "All notifications marked as read"
        );
    }

    if (!id) {
        throw new ValidationError("Notification ID is required");
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: id, user: req.user.id },
        { $set: { read: true, readAt: new Date() } },
        { new: true }
    );

    if (!notification) {
        throw new NotFoundError("Notification");
    }

    return successResponse(notification, "Notification marked as read");
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
async function deleteNotification(req) {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll) {
        // Delete all read notifications
        const result = await Notification.deleteMany({
            user: req.user.id,
            read: true
        });

        return successResponse(
            { deletedCount: result.deletedCount },
            "Read notifications cleared"
        );
    }

    if (!id) {
        throw new ValidationError("Notification ID is required");
    }

    const notification = await Notification.findOneAndDelete({
        _id: id,
        user: req.user.id
    });

    if (!notification) {
        throw new NotFoundError("Notification");
    }

    return successResponse(
        { deleted: true },
        "Notification deleted"
    );
}

// Apply middleware
const authMiddleware = (handler) => withAuth(handler);

export const GET = withErrorHandler(authMiddleware(getNotifications));
export const PATCH = withErrorHandler(authMiddleware(markAsRead));
export const DELETE = withErrorHandler(authMiddleware(deleteNotification));
