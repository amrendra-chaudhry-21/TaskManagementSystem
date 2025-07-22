import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
import { DB_STORE_NAME } from "../constant.js";
dotenv.config({ path: "./.env" });

const isDev = process.env.NODE_ENV !== "production";
const isReadPrimary = process.env.READ_PREFERENCE === "primary";
const connectionOptions = {
  maxPoolSize: parseInt(process.env.MAX_POOL_SIZE, 10) || 350,
  minPoolSize: parseInt(process.env.MIN_POOL_SIZE, 10) || 150,
  serverSelectionTimeoutMS:
    parseInt(process.env.SERVER_SELECTION_TIMEOUT_MS, 10) || 30000,
  socketTimeoutMS: parseInt(process.env.SOCKET_TIMEOUT_MS, 10) || 60000,
  connectTimeoutMS: parseInt(process.env.CONNECT_TIMEOUT_MS, 10) || 30000,
  waitQueueTimeoutMS: parseInt(process.env.WAIT_QUEUE_TIMEOUT_MS, 10) || 10000,
  heartbeatFrequencyMS:
    parseInt(process.env.HEARTBEAT_FREQUENCY_MS, 10) || 10000,
  maxIdleTimeMS: parseInt(process.env.MAX_IDLE_TIME_MS, 10) || 30000,
  maxStalenessSeconds: parseInt(process.env.MAX_STALENESS_SECONDS, 10) || 90,
  compressors: [process.env.COMPRESSION || "zlib"],
  zlibCompressionLevel: parseInt(process.env.ZLIB_COMPRESSION_LEVEL, 10) || 6,
  readPreference: process.env.READ_PREFERENCE || "primary",
  retryReads: process.env.RETRY_READS === "true",
  retryWrites: process.env.RETRY_WRITES === "true",
  writeConcern: {
    w: process.env.WRITE_CONCERN || "majority",
    journal: process.env.JOURNAL_COMMITTED === "true",
    timeout: 5000,
  },
  readConcern: { level: "majority" },
  ...(isDev && isReadPrimary ? { autoIndex: true, autoCreate: true } : {}),
};

let isConnected = false;
let connectionPromise = null;

const connectDB = async (retries = 5, delay = 1000) => {
  if (isConnected) {
    logger.info("📊 Already connected to MongoDB");
    return mongoose.connection;
  }
  if (connectionPromise) {
    logger.info("📊 MongoDB connection in progress, waiting...");
    return connectionPromise;
  }
  connectionPromise = _connectDB(retries, delay);
  return connectionPromise;
};

const _connectDB = async (retries, delay) => {
  try {
    if (!process.env.MONGOOSE_URI) {
      throw new Error("❌ MONGOOSE_URI is not defined in .env");
    }
    mongoose.connection.on("connected", () => {
      isConnected = true;
      logger.success(
        "🐵 Jai Bajrang Bali, Connected to MongoDB Sharded Cluster!"
      );
    });
    logger.success(`🎱 Connection Pool Size: ${connectionOptions.maxPoolSize}`);
    mongoose.connection.on("error", (err) => {
      logger.error("❌ MongoDB connection error:", err.message);
      isConnected = false;
    });
    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected");
      isConnected = false;
    });
    mongoose.connection.on("reconnected", () => {
      logger.info("🔄 MongoDB reconnected");
      isConnected = true;
    });
    await mongoose.connect(
      `${process.env.MONGOOSE_URI}/${DB_STORE_NAME}`,
      connectionOptions
    );
    if (process.env.NODE_ENV === "development") {
      mongoose.set("debug", true);
    }
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    if (retries > 0) {
      logger.warn(`🔁 Retry connecting (${retries} left)...`);
      await new Promise((res) => setTimeout(res, delay));
      return _connectDB(retries - 1, delay * 2);
    } else {
      logger.error("❌ Final MongoDB connection attempt failed", {
        error: error.message,
      });
      throw error;
    }
  }
};

const closeDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      isConnected = false;
      connectionPromise = null;
      logger.info("🔌 MongoDB connection closed cleanly");
    }
  } catch (error) {
    logger.error("❌ Failed to close MongoDB connection", {
      error: error.message,
    });
    throw error;
  }
};
const checkDBHealth = async () => {
  const start = Date.now();
  try {
    await mongoose.connection.db.admin().ping();
    const end = Date.now();
    return {
      status: "healthy",
      pingMs: end - start,
      timestamp: new Date(),
    };
  } catch (error) {
    const end = Date.now();
    return {
      status: "unhealthy",
      pingMs: end - start,
      error: error.message,
      timestamp: new Date(),
    };
  }
};

export { connectDB, closeDB, checkDBHealth };
