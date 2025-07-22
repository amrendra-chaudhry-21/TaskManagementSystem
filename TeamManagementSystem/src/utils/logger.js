import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const { combine, timestamp, printf, colorize, json, errors, splat } = format;
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    success: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "red",
    warn: "yellow",
    info: "green",
    success: "blue",
    debug: "magenta",
  },
};
import winston from "winston";
winston.addColors(customLevels.colors);
const consoleLogFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});
const logger = createLogger({
  levels: customLevels.levels,
  level: "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    splat(),
    json()
  ),
  transports: [
    new transports.Console({
      level: "debug",
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        consoleLogFormat
      ),
    }),
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "info",
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
      level: "error",
    }),
  ],
});
logger.success = (message) =>
  logger.log({ level: "success", message: `✅ ${message}` });
logger.failed = (message) =>
  logger.log({ level: "error", message: `❌ ${message}` });
process.on("uncaughtException", (error) => {
  logger.fatal("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.fatal("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

export default logger;
