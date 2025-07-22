import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== "string") {
      throw new ApiError(401, "Unauthorized!", {
        reason: "Missing or invalid authorization header!",
        solution: "Provide a valid 'Bearer <token>' header!",
      });
    }
    if (!authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized!", {
        reason: "Invalid authorization header format!",
        solution: "Use 'Bearer <token>' format!",
      });
    }

    const token = authHeader.split(" ")[1].trim();
    if (!token) {
      throw new ApiError(401, "Unauthorized!", {
        reason: "Empty token provided!",
        solution: "Include a valid Bearer token!",
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded.id) {
      throw new ApiError(401, "Invalid Token!", {
        reason: "Token does not contain a valid user ID!",
        solution: "Provide a valid token!",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new ApiError(401, "Token Expired!", {
          reason: "Session expired!",
          solution: "Login again!",
        })
      );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(
        new ApiError(401, "Invalid Token!", {
          reason: "Token malformed or invalid signature!",
          solution: "Provide a valid token!",
        })
      );
    }
    return next(
      error instanceof ApiError
        ? error
        : new ApiError(401, "Authentication Failed!", {
            reason: error.message || "Unable to authenticate!",
            solution:
              "Please check your token and try again or contact support!",
          })
    );
  }
};
