import logger from "./logger.js";
const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      error.requestId = req.id;
      error.path = req.path;
      error.method = req.method;
      logger.error({
        message: error.message,
        stack: error.stack,
        requestId: req.id,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  };
};

export { asyncHandler };
