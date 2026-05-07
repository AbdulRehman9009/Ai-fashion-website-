import mongoose from "mongoose";
import { logger } from "./logger";

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const CONNECTION_TIMEOUT = 10000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function connectDB(retryCount = 0) {
  if (cached.conn) {
    return cached.conn;
  }
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      cached.promise = null;
      if (retryCount < MAX_RETRIES) {
        logger.warn(`Database connection attempt ${retryCount + 1} failed, retrying...`, {
          error: error.message
        });
        await sleep(RETRY_DELAY);
        return connectDB(retryCount + 1);
      }
      throw error;
    }
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }
  cached.promise = mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: CONNECTION_TIMEOUT,
    socketTimeoutMS: 45000,
  })
    .then((mongoose) => {
      logger.info("MongoDB connected successfully", {
        host: mongoose.connection.host,
        name: mongoose.connection.name
      });

      mongoose.connection.on('error', (err) => {
        logger.error("MongoDB connection error", { error: err.message });
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn("MongoDB disconnected");
      });

      mongoose.connection.on('reconnected', () => {
        logger.info("MongoDB reconnected");
      });

      return mongoose;
    })
    .catch((error) => {
      logger.error("MongoDB connection failed", {
        error: error.message,
        stack: error.stack,
        retryCount
      });

      cached.promise = null;

      
      if (retryCount < MAX_RETRIES) {
        logger.warn(`Retrying database connection (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
        return sleep(RETRY_DELAY).then(() => connectDB(retryCount + 1));
      }

      throw error;
    });

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

/**
 * Disconnect from MongoDB gracefully
 */
export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    logger.info("MongoDB disconnected gracefully");
  }
}

/**
 * Check database connection status
 */
export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Get database connection stats
 */
export function getConnectionStats() {
  if (!cached.conn) {
    return { connected: false };
  }

  return {
    connected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    readyState: mongoose.connection.readyState,
    models: Object.keys(mongoose.connection.models)
  };
}

