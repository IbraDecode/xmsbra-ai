const logger = require("../utils/logger")

/**
 * API Key authentication middleware
 * Validates x-api-key header against environment variable
 */
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"]
  const validApiKey = process.env.API_KEY || "gratisyakocak"

  // Log authentication attempt
  logger.info("Authentication attempt", {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    endpoint: req.path,
  })

  if (!apiKey) {
    logger.warn("Missing API key", { ip: req.ip })
    return res.status(401).json({
      status: 401,
      error: "API key required. Please provide x-api-key header.",
    })
  }

  if (apiKey !== validApiKey) {
    logger.warn("Invalid API key attempt", {
      ip: req.ip,
      providedKey: apiKey.substring(0, 5) + "...",
    })
    return res.status(401).json({
      status: 401,
      error: "Invalid API key",
    })
  }

  logger.info("Authentication successful", { ip: req.ip })
  next()
}

module.exports = authMiddleware
