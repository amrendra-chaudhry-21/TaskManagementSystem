import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import http from "http";
import cluster from "cluster";
import os from "os";
import { app } from "./app.js";
import logger from "./utils/logger.js";
import { checkDBHealth, closeDB, connectDB } from "./config/index.js";
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || "production";
const CLUSTER_MODE = process.env.CLUSTER_MODE === "true";
const WORKER_COUNT = parseInt(process.env.WORKER_COUNT, 10) || os.cpus().length;
const server = http.createServer(app);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 125 * 1000;

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    logger.info("HTTP server closed");
  });
  try {
    await closeDB();
    logger.info("✅ Graceful shutdown completed");
    process.exit(0);
  } catch (err) {
    logger.error(`❌ Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("beforeExit", async () => {
  logger.info("Server is exiting... Cleaning up resources.");
  await closeDB();
});

if (CLUSTER_MODE && cluster.isPrimary) {
  logger.info(`🔄 Primary ${process.pid} is running in cluster mode!`);
  for (let i = 0; i < WORKER_COUNT; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    logger.error(
      `⚠ Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`
    );
    worker.disconnect();
    cluster.fork();
  });
  process.on("SIGUSR2", () => {
    logger.info("♻ Restarting workers gracefully...");
    for (const id in cluster.workers) {
      cluster.workers[id].disconnect();
      cluster.fork();
    }
  });
} else {
  const startServer = async () => {
    try {
      await connectDB();
      const health = await checkDBHealth();
      if (health.status === "healthy") {
        logger.success(
          `🏓 MongoDB is healthy and responded in ${health.pingMs}ms.`
        );
      } else {
        logger.error(
          "❌ MongoDB health check failed. Database is unreachable or unresponsive.",
          {
            status: health.status,
            pingMs: health.pingMs,
            error: health.error,
            timestamp: health.timestamp,
          }
        );
      }
      server.listen(PORT, () => {
        logger.success(
          `🚩 Ram Ram Ji, Server is Running on HTTP Port: ${PORT}!`
        );
      });
    } catch (err) {
      logger.error(`❌ Server initialization failed: ${err.message}`);
      process.exit(1);
    }
  };
  startServer();
}

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`);
  logger.error(`Stack trace: ${reason.stack}`);
  if (NODE_ENV === "production" && CLUSTER_MODE) {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  logger.error(`❌ Uncaught Exception: ${err.message}`);
  if (NODE_ENV === "production" && CLUSTER_MODE) {
    process.exit(1);
  }
});
