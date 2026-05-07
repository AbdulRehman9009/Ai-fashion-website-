
import mongoose from "mongoose";
import { connectDB } from "./db";
import { DatabaseError } from "./errors";
import { logger, createTimer } from "./logger";


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
