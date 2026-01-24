/**
 * MongoDB Transaction Wrapper
 * Provides a clean way to handle database transactions
 */

import mongoose from "mongoose";
import { connectDB } from "./db";
import { DatabaseError } from "./errors";
import { logger, createTimer } from "./logger";

/**
 * Execute operations within a transaction
 * Automatically commits on success, aborts on error
 * 
 * @param {Function} operations - Async function containing operations
 * @returns {*} Result of operations
 * 
 * @example
 * const result = await withTransaction(async (session) => {
 *   await Order.create([orderData], { session });
 *   await Product.updateMany({ _id: { $in: productIds }}, { $inc: { stock: -1 }}, { session });
 *   return order;
 * });
 */
export async function withTransaction(operations) {
    await connectDB();

    const session = await mongoose.startSession();
    const timer = createTimer();

    try {
        logger.debug("Starting database transaction");
        session.startTransaction();

        const result = await operations(session);

        await session.commitTransaction();
        const duration = timer();

        logger.debug(`Transaction committed successfully`, { duration });
        return result;

    } catch (error) {
        await session.abortTransaction();
        const duration = timer();

        logger.error("Transaction aborted", {
            error: error.message,
            duration
        });

        throw new DatabaseError(
            "Transaction failed: " + error.message,
            error
        );

    } finally {
        session.endSession();
    }
}

/**
 * Retry a database operation with exponential backoff
 * Useful for handling transient errors
 * 
 * @param {Function} operation - Async operation to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 */
export async function retryOperation(operation, maxRetries = 3, initialDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt);
                logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`, {
                    error: error.message
                });
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw new DatabaseError(
        `Operation failed after ${maxRetries} retries: ${lastError.message}`,
        lastError
    );
}
