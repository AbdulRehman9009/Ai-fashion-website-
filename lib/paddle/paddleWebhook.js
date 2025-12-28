import crypto from 'crypto';

/**
 * Verify Paddle webhook signature
 */
export function verifyPaddleSignature(requestBody, signature, secret) {
    try {
        const ts = signature.split(';')[0].split('=')[1];
        const h1 = signature.split(';')[1].split('=')[1];

        const signedPayload = `${ts}:${JSON.stringify(requestBody)}`;
        const computedHash = crypto
            .createHmac('sha256', secret)
            .update(signedPayload)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(h1),
            Buffer.from(computedHash)
        );
    } catch (error) {
        console.error("Error verifying Paddle signature:", error);
        return false;
    }
}

/**
 * Parse Paddle webhook event
 */
export function parsePaddleEvent(body) {
    try {
        return {
            eventType: body.event_type,
            eventId: body.event_id,
            occurredAt: body.occurred_at,
            notificationId: body.notification_id,
            data: body.data
        };
    } catch (error) {
        console.error("Error parsing Paddle event:", error);
        return null;
    }
}

/**
 * Extract order ID from custom data
 */
export function extractOrderId(customData) {
    try {
        if (typeof customData === 'string') {
            const parsed = JSON.parse(customData);
            return parsed.order_id;
        }
        return customData?.order_id;
    } catch (error) {
        console.error("Error extracting order ID:", error);
        return null;
    }
}
