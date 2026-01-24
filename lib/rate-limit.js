/**
 * Rate limiting middleware for API routes
 * Uses in-memory store - for production, use Redis
 */

const rateLimitMap = new Map();

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitMap.entries()) {
        if (data.resetTime < now) {
            rateLimitMap.delete(key);
        }
    }
}, 60000); // Clean every minute

/**
 * Get client IP from request headers
 */
function getClientIP(req) {
    const forwarded = req.headers.get?.('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.headers.get?.('x-real-ip') || 'unknown';
}

/**
 * Rate limit check for API routes
 * @param {Request} req - The request object
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000)
 * @param {number} options.max - Max requests per window (default: 100)
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(req, options = {}) {
    const { windowMs = 60000, max = 100 } = options;
    const ip = getClientIP(req);
    const now = Date.now();

    let data = rateLimitMap.get(ip);

    // Reset if window expired
    if (!data || data.resetTime < now) {
        data = {
            count: 0,
            resetTime: now + windowMs
        };
    }

    data.count++;
    rateLimitMap.set(ip, data);

    const remaining = Math.max(0, max - data.count);
    const allowed = data.count <= max;

    return {
        allowed,
        remaining,
        resetTime: data.resetTime,
        retryAfter: allowed ? 0 : Math.ceil((data.resetTime - now) / 1000)
    };
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(result, max) {
    return {
        'X-RateLimit-Limit': String(max),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000))
    };
}
