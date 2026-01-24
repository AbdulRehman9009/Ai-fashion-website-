/**
 * Admin Audit Logs API
 * View and filter audit logs (Admin only)
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { withErrorHandler, withAuth } from "@/lib/api-middleware";
import { paginatedResponse } from "@/lib/api-response";
import { paginationSchema, validate } from "@/lib/validation/schemas";
import { ValidationError } from "@/lib/errors";

/**
 * GET /api/admin/audit-logs
 * Get audit logs with filtering and pagination
 * 
 * @query {number} page - Page number
 * @query {number} limit - Items per page
 * @query {string} userId - Filter by user ID
 * @query {string} action - Filter by action type
 * @query {string} resource - Filter by resource type
 * @query {string} startDate - Filter from date
 * @query {string} endDate - Filter to date
 */
async function getAuditLogs(req) {
    await connectDB();

    const { searchParams } = new URL(req.url);

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
    const query = {};

    if (searchParams.get('userId')) {
        query.user = searchParams.get('userId');
    }

    if (searchParams.get('action')) {
        query.action = searchParams.get('action');
    }

    if (searchParams.get('resource')) {
        query.resource = searchParams.get('resource');
    }

    if (searchParams.get('startDate') || searchParams.get('endDate')) {
        query.timestamp = {};
        if (searchParams.get('startDate')) {
            query.timestamp.$gte = new Date(searchParams.get('startDate'));
        }
        if (searchParams.get('endDate')) {
            query.timestamp.$lte = new Date(searchParams.get('endDate'));
        }
    }

    const [logs, total] = await Promise.all([
        AuditLog.find(query)
            .populate('user', 'name email role')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        AuditLog.countDocuments(query)
    ]);

    return paginatedResponse(logs, { page, limit, total });
}

/**
 * GET /api/admin/audit-logs/stats
 * Get audit log statistics
 */
async function getAuditStats(req) {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get action counts
    const actionCounts = await AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    // Get resource counts
    const resourceCounts = await AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$resource', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    // Get daily activity
    const dailyActivity = await AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
        success: true,
        data: {
            topActions: actionCounts,
            resourceActivity: resourceCounts,
            dailyActivity: dailyActivity,
            totalLogs: await AuditLog.countDocuments({ timestamp: { $gte: startDate } })
        }
    });
}

// Apply middleware - Admin only
const adminAuth = (handler) => withAuth(handler, { roles: ['ADMIN'] });

export const GET = withErrorHandler(adminAuth(getAuditLogs));
