const rateLimit = require("express-rate-limit")
const logger = require("../utils/logger")

/**
 * Rate limiting middleware
 * Limits requests to 20 per minute per IP
 */
const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    status: 429,
    error: "Too many requests. Please try again later.",
    retryAfter: "1 minute",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    })
    res.status(429).json({
      status: 429,
      error: "Too many requests. Please try again later.",
      retryAfter: "1 minute",
    })
  },
})

module.exports = rateLimitMiddleware
