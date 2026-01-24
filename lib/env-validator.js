/**
 * Environment Variable Validator
 * Validates required environment variables on application startup
 */

import { logger } from "./logger";

/**
 * Environment variable definitions
 */
const ENV_VARS = {
    // Required variables
    required: {
        MONGODB_URI: {
            validator: (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
            message: "Must be a valid MongoDB connection string"
        },
        NEXTAUTH_SECRET: {
            validator: (val) => val.length >= 32,
            message: "Must be at least 32 characters long"
        },
        NEXTAUTH_URL: {
            validator: (val) => val.startsWith('http://') || val.startsWith('https://'),
            message: "Must be a valid URL"
        }
    },

    // Optional but recommended variables
    recommended: {
        GOOGLE_CLIENT_ID: {
            message: "Required for Google OAuth login"
        },
        GOOGLE_CLIENT_SECRET: {
            message: "Required for Google OAuth login"
        },
        PADDLE_API_KEY: {
            message: "Required for payment processing"
        },
        CLOUDINARY_CLOUD_NAME: {
            message: "Required for image uploads"
        },
        GEMINI_API_KEY: {
            message: "Required for AI recommendations"
        }
    },

    // Production-specific variables
    production: {
        NODE_ENV: {
            validator: (val) => val === 'production',
            message: "Should be set to 'production'"
        }
    }
};

/**
 * Validate a single environment variable
 */
function validateEnvVar(name, config, value) {
    if (!value) {
        return { valid: false, message: `${name} is not set` };
    }

    if (config.validator && !config.validator(value)) {
        return { valid: false, message: `${name}: ${config.message}` };
    }

    return { valid: true };
}

/**
 * Validate all environment variables
 * @returns {Object} { isValid, errors, warnings }
 */
export function validateEnv() {
    const errors = [];
    const warnings = [];
    const isProduction = process.env.NODE_ENV === 'production';

    // Check required variables
    for (const [name, config] of Object.entries(ENV_VARS.required)) {
        const result = validateEnvVar(name, config, process.env[name]);
        if (!result.valid) {
            errors.push(result.message);
        }
    }

    // Check recommended variables
    for (const [name, config] of Object.entries(ENV_VARS.recommended)) {
        if (!process.env[name]) {
            warnings.push(`${name} is not set. ${config.message}`);
        }
    }

    // Check production-specific variables
    if (isProduction) {
        for (const [name, config] of Object.entries(ENV_VARS.production)) {
            const result = validateEnvVar(name, config, process.env[name]);
            if (!result.valid) {
                warnings.push(result.message);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate environment and log results
 * Throws error if validation fails in production
 */
export function checkEnvironment() {
    const result = validateEnv();

    if (result.errors.length > 0) {
        logger.error("Environment validation failed", { errors: result.errors });

        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                "Missing required environment variables:\n" +
                result.errors.join('\n')
            );
        } else {
            console.error("\n❌ Environment Validation Errors:");
            result.errors.forEach(err => console.error(`  - ${err}`));
        }
    }

    if (result.warnings.length > 0) {
        logger.warn("Environment validation warnings", { warnings: result.warnings });

        if (process.env.NODE_ENV !== 'production') {
            console.warn("\n⚠️  Environment Warnings:");
            result.warnings.forEach(warn => console.warn(`  - ${warn}`));
        }
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
        logger.info("Environment validation passed");
    }

    return result;
}

/**
 * Get safe environment info (without secrets)
 */
export function getEnvInfo() {
    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasMongoUri: !!process.env.MONGODB_URI,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasGoogleAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        hasGithubAuth: !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
        hasPaddle: !!process.env.PADDLE_API_KEY,
        hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasGemini: !!process.env.GEMINI_API_KEY
    };
}
