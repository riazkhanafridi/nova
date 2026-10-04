import logError from "../utils/errorLogger.js";

const ErrorMiddleware = (err, req, res, next) => {
  logError(err);
  err.message = err.message || "Internal server error";
  err.statusCode = err?.statusCode || 500;

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorMiddleware;
