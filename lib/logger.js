

const isDevelopment = process.env.NODE_ENV === 'development';

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

function formatLog(level, message, meta = {}) {
    const timestamp = new Date().toISOString();

    if (isDevelopment) {
        // Pretty print for development
        const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    } else {
        return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta
        });
    }
}


function createLogger(level, levelValue) {
    return (message, meta = {}) => {
        if (levelValue <= currentLevel) {
            const formatted = formatLog(level, message, meta);

            if (level === 'ERROR') {
                console.error(formatted);
            } else if (level === 'WARN') {
                console.warn(formatted);
            } else {
                console.log(formatted);
            }
        }
    };
}

export const logger = {
    error: createLogger('ERROR', LOG_LEVELS.ERROR),
    warn: createLogger('WARN', LOG_LEVELS.WARN),
    info: createLogger('INFO', LOG_LEVELS.INFO),
    debug: createLogger('DEBUG', LOG_LEVELS.DEBUG),

    /**
     * Log HTTP request
     */
    request: (method, path, statusCode, duration, meta = {}) => {
        logger.info(`${method} ${path} ${statusCode} - ${duration}ms`, {
            type: 'http_request',
            method,
            path,
            statusCode,
            duration,
            ...meta
        });
    },

    /**
     * Log database query
     */
    query: (operation, collection, duration, meta = {}) => {
        logger.debug(`DB ${operation} on ${collection} - ${duration}ms`, {
            type: 'database_query',
            operation,
            collection,
            duration,
            ...meta
        });
    },

    /**
     * Log external service call
     */
    external: (service, operation, duration, success, meta = {}) => {
        const level = success ? 'info' : 'warn';
        logger[level](`External: ${service}.${operation} - ${duration}ms (${success ? 'success' : 'failed'})`, {
            type: 'external_service',
            service,
            operation,
            duration,
            success,
            ...meta
        });
    }
};

/**
 * Create a timer for measuring execution time
 */
export function createTimer() {
    const start = Date.now();
    return () => Date.now() - start;
}
