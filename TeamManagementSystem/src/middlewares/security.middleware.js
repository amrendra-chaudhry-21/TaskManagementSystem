import helmet from "helmet";
import hpp from "hpp";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config({ path: "./.env" });

const securityMiddleware = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "trusted-cdn.com"],
          styleSrc: ["'self'", "fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "cdn.example.com"],
          fontSrc: ["'self'", "fonts.gstatic.com"],
          connectSrc: ["'self'", "api.example.com"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  app.use(xss());
  app.use(hpp());
  app.use(mongoSanitize());
  app.use((req, res, next) => {
    if (req.body) {
      Object.keys(req.body).forEach((key) => {
        req.body[key] = sanitizeInput(req.body[key]);
      });
    }
    if (req.query) {
      Object.keys(req.query).forEach((key) => {
        req.query[key] = sanitizeInput(req.query[key]);
      });
    }
    if (req.params) {
      Object.keys(req.params).forEach((key) => {
        req.params[key] = sanitizeInput(req.params[key]);
      });
    }
    next();
  });
};

const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  return input;
};
export const requestIdMiddleware = (req, res, next) => {
  req.id = uuidv4();
  next();
};

export { securityMiddleware };
