import { ApiError } from "./ApiError.js";
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  const errorResponse = {
    success: false,
    message: message,
    error: {
      type: "InternalServerError",
      reason: "An unexpected error occurred!",
      solution: "Please try again later!",
      timestamp: new Date().toISOString(),
    },
  };
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorResponse.message = err.message;
    errorResponse.error = err.error;
  }
  if ((!err) instanceof ApiError && err.stack) {
    errorResponse.error.metadata = {
      stack: err.stack.split("\n")[0],
    };
  }
  res.status(statusCode).json(errorResponse);
};
export { errorMiddleware };
