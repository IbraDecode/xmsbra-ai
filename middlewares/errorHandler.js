const logger = require("../utils/logger")

/**
 * Centralized error handling middleware
 * Logs errors and returns appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  })

  // Default error response
  let status = 500
  let message = "Internal Server Error"

  // Handle specific error types
  if (err.name === "ValidationError") {
    status = 400
    message = "Validation Error"
  } else if (err.name === "UnauthorizedError") {
    status = 401
    message = "Unauthorized"
  } else if (err.status) {
    status = err.status
    message = err.message
  }

  res.status(status).json({
    status: status,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorHandler
