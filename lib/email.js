/**
 * Email Service
 * Handles sending transactional emails
 * 
 * For production, configure with:
 * - Resend (recommended)
 * - SendGrid
 * - AWS SES
 * - Nodemailer with SMTP
 */

import { logger } from "./logger";

// Email templates
const TEMPLATES = {
    verification: (token, name) => ({
        subject: "Verify your email - StyleGenie",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ea580c;">Welcome to StyleGenie!</h1>
        <p>Hi ${name || "there"},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}" 
           style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours. If you didn't create an account, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">StyleGenie - AI-Powered Fashion Platform</p>
      </div>
    `
    }),

    passwordReset: (token, name) => ({
        subject: "Reset your password - StyleGenie",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ea580c;">Password Reset Request</h1>
        <p>Hi ${name || "there"},</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <a href="${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}" 
           style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">StyleGenie - AI-Powered Fashion Platform</p>
      </div>
    `
    }),

    orderConfirmation: (order) => ({
        subject: `Order Confirmed #${order._id.toString().slice(-6)} - StyleGenie`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ea580c;">Order Confirmed!</h1>
        <p>Thank you for your order.</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
          <p><strong>Total:</strong> $${order.pricing?.grandTotal?.toFixed(2)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/user/orders/${order._id}" 
           style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Order
        </a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">StyleGenie - AI-Powered Fashion Platform</p>
      </div>
    `
    })
};

/**
 * Send email using configured provider
 * @param {string} to - Recipient email
 * @param {string} template - Template name
 * @param {Object} data - Template data
 */
export async function sendEmail(to, template, data = {}) {
    const emailConfig = TEMPLATES[template];

    if (!emailConfig) {
        throw new Error(`Unknown email template: ${template}`);
    }

    const { subject, html } = typeof emailConfig === 'function'
        ? emailConfig(data.token, data.name, data.order)
        : emailConfig;

    // Check for email provider configuration
    const provider = process.env.EMAIL_PROVIDER || 'console';

    try {
        switch (provider) {
            case 'resend':
                return await sendWithResend(to, subject, html);

            case 'sendgrid':
                return await sendWithSendGrid(to, subject, html);

            case 'console':
            default:
                // Development: Log to console
                logger.info("📧 Email would be sent:", { to, subject });
                console.log("---EMAIL CONTENT---");
                console.log(`To: ${to}`);
                console.log(`Subject: ${subject}`);
                console.log("---END EMAIL---");
                return { success: true, provider: 'console' };
        }
    } catch (error) {
        logger.error("Email send failed:", { to, template, error: error.message });
        throw error;
    }
}

/**
 * Send with Resend
 */
async function sendWithResend(to, subject, html) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'StyleGenie <noreply@stylegenie.com>',
        to,
        subject,
        html
    });

    return { success: true, id: result.id, provider: 'resend' };
}

/**
 * Send with SendGrid
 */
async function sendWithSendGrid(to, subject, html) {
    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.default.send({
        from: process.env.EMAIL_FROM || 'noreply@stylegenie.com',
        to,
        subject,
        html
    });

    return { success: true, provider: 'sendgrid' };
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email, token, name) {
    return sendEmail(email, 'verification', { token, name });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, token, name) {
    return sendEmail(email, 'passwordReset', { token, name });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(email, order) {
    return sendEmail(email, 'orderConfirmation', { order });
}
