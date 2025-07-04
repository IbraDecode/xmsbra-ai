const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

// Import middlewares
const authMiddleware = require("./middlewares/auth")
const rateLimitMiddleware = require("./middlewares/rateLimit")
const errorHandler = require("./middlewares/errorHandler")

// Import controllers
const ibradecodeController = require("./controllers/ibradecodeController")

// Import utils
const logger = require("./utils/logger")

// Initialize database
require("./models/initDB")

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Serve static files
app.use(express.static(path.join(__dirname, "public")))

// Apply rate limiting to API routes
app.use("/api", rateLimitMiddleware)

// API Routes with authentication
app.post("/api/xmsbra/ibradecodeprojects", authMiddleware, ibradecodeController.processPrompt)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "XMsbra AI API is running",
    timestamp: new Date().toISOString(),
  })
})

// Root route - serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Error handling middleware (must be last)
app.use(errorHandler)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: 404,
    error: "Endpoint not found",
  })
})

// Start server
app.listen(PORT, () => {
  logger.info(`XMsbra AI Server running on port ${PORT}`)
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`)
})

module.exports = app
