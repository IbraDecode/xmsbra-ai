const { executeAIPipeline } = require("../services/ollama")
const Conversation = require("../models/conversation")
const logger = require("../utils/logger")

/**
 * Process user prompt through AI pipeline and save to database
 * POST /api/xmsbra/ibradecodeprojects
 */
const processPrompt = async (req, res) => {
  try {
    const { prompt } = req.body

    // Validate input
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      logger.warn("Invalid prompt provided", { ip: req.ip })
      return res.status(400).json({
        status: 400,
        error: "Prompt is required and must be a non-empty string",
      })
    }

    if (prompt.length > 5000) {
      logger.warn("Prompt too long", { ip: req.ip, length: prompt.length })
      return res.status(400).json({
        status: 400,
        error: "Prompt must be less than 5000 characters",
      })
    }

    logger.info("Processing prompt request", {
      ip: req.ip,
      promptLength: prompt.length,
      userAgent: req.get("User-Agent"),
    })

    // Execute AI pipeline
    const result = await executeAIPipeline(prompt)

    // Save to database
    const conversation = await Conversation.create({
      userId: req.headers["x-user-id"] || null, // Optional user ID
      prompt: prompt.trim(),
      summary: result.summary,
      optimizedPrompt: result.optimizedPrompt,
      codeResult: result.codeResult,
    })

    logger.info("Conversation saved to database", {
      conversationId: conversation.id,
      ip: req.ip,
    })

    // Return successful response
    res.status(200).json({
      status: 200,
      data: {
        id: conversation.id,
        summary: result.summary,
        optimizedPrompt: result.optimizedPrompt,
        codeResult: result.codeResult,
        timestamp: conversation.timestamp,
      },
    })
  } catch (error) {
    logger.error("Error processing prompt", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    })

    // Return appropriate error response
    if (error.message.includes("Ollama service is not running")) {
      res.status(503).json({
        status: 503,
        error: "AI service temporarily unavailable. Please try again later.",
      })
    } else if (error.message.includes("Timeout")) {
      res.status(504).json({
        status: 504,
        error: "Request timeout. The AI model is processing. Please try again.",
      })
    } else {
      res.status(500).json({
        status: 500,
        error: "Internal server error occurred while processing your request",
      })
    }
  }
}

module.exports = {
  processPrompt,
}
