/**
 * Health Check API Endpoint
 * Provides system health status and service availability
 */

import { NextResponse } from "next/server";
import { isDatabaseConnected, getConnectionStats } from "@/lib/db";
import { getEnvInfo } from "@/lib/env-validator";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createTimer } from "@/lib/logger";

/**
 * Check external service health
 */
async function checkExternalServices() {
    const services = {
        database: { status: 'unknown', latency: 0 },
        paddle: { status: 'unknown' },
        cloudinary: { status: 'unknown' },
        gemini: { status: 'unknown' }
    };

    // Check database
    try {
        const timer = createTimer();
        const isConnected = isDatabaseConnected();
        const latency = timer();

        services.database = {
            status: isConnected ? 'up' : 'down',
            latency: `${latency}ms`
        };
    } catch (error) {
        services.database = {
            status: 'down',
            error: error.message
        };
    }

    // Check Paddle (basic check - API key exists)
    services.paddle = {
        status: process.env.PADDLE_API_KEY ? 'configured' : 'not_configured'
    };

    // Check Cloudinary (basic check - credentials exist)
    services.cloudinary = {
        status: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not_configured'
    };

    // Check Gemini AI (basic check - API key exists)
    services.gemini = {
        status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured'
    };

    return services;
}

/**
 * GET /api/health
 * Returns system health status
 */
export async function GET() {
    try {
        const startTime = Date.now();

        const services = await checkExternalServices();
        const dbStats = getConnectionStats();
        const envInfo = getEnvInfo();

        // Determine overall health status
        const isHealthy = services.database.status === 'up';
        const status = isHealthy ? 'healthy' : 'degraded';

        const healthData = {
            status,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services,
            database: {
                connected: dbStats.connected,
                ...(dbStats.connected && {
                    host: dbStats.host,
                    name: dbStats.name,
                    models: dbStats.models?.length || 0
                })
            },
            environment: envInfo,
            version: process.env.npm_package_version || 'unknown'
        };

        // Return 503 if critical services are down
        const statusCode = isHealthy ? 200 : 503;

        return NextResponse.json(healthData, { status: statusCode });

    } catch (error) {
        return errorResponse(error);
    }
}
