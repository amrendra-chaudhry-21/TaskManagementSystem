class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errorDetails = {}) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.error = {
      statusCode: statusCode,
      type: this.getErrorType(statusCode),
      reason: errorDetails.reason || this.getDefaultReason(statusCode),
      solution: errorDetails.solution || this.getDefaultSolution(statusCode),
      timestamp: new Date().toISOString(),
      ...(errorDetails.metadata && { metadata: errorDetails.metadata }),
    };
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  getErrorType(statusCode) {
    const errorTypes = {
      400: "BadRequest",
      401: "Unauthorized",
      402: "PaymentRequired",
      403: "Forbidden",
      404: "NotFound",
      405: "MethodNotAllowed",
      406: "NotAcceptable",
      407: "ProxyAuthenticationRequired",
      408: "RequestTimeout",
      409: "Conflict",
      410: "Gone",
      411: "LengthRequired",
      412: "PreconditionFailed",
      413: "PayloadTooLarge",
      414: "URITooLong",
      415: "UnsupportedMediaType",
      416: "RangeNotSatisfiable",
      417: "ExpectationFailed",
      418: "ImATeapot",
      422: "UnprocessableEntity",
      423: "Locked",
      424: "FailedDependency",
      425: "TooEarly",
      426: "UpgradeRequired",
      428: "PreconditionRequired",
      429: "TooManyRequests",
      431: "RequestHeaderFieldsTooLarge",
      451: "UnavailableForLegalReasons",
      500: "InternalServerError",
      501: "NotImplemented",
      502: "BadGateway",
      503: "ServiceUnavailable",
      504: "GatewayTimeout",
      505: "HTTPVersionNotSupported",
      506: "VariantAlsoNegotiates",
      507: "InsufficientStorage",
      508: "LoopDetected",
      510: "NotExtended",
      511: "NetworkAuthenticationRequired",
    };
    return errorTypes[statusCode] || "UnknownError";
  }
  getDefaultReason(statusCode) {
    const defaultReasons = {
      400: "The server cannot process the request due to client error",
      401: "Authentication is required and has failed or not been provided",
      403: "The server understood the request but refuses to authorize it",
      404: "The requested resource could not be found",
      500: "An unexpected condition was encountered by the server",
    };
    return defaultReasons[statusCode] || "Unknown reason";
  }
  getDefaultSolution(statusCode) {
    const defaultSolutions = {
      400: "Check your request parameters and try again",
      401: "Provide valid authentication credentials",
      403: "Ensure you have proper permissions to access this resource",
      404: "Verify the resource exists and the URL is correct",
      500: "Please try again later or contact support",
    };
    return defaultSolutions[statusCode] || "Please try again later";
  }
}
export { ApiError };
