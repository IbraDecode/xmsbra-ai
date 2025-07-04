const axios = require("axios")
const logger = require("../utils/logger")

const OLLAMA_BASE_URL = "http://localhost:11434/api/generate"

/**
 * Reusable function to call Ollama models
 * @param {string} model - Model name (phi3, mistral, deepseek-coder:6.7b)
 * @param {string} prompt - Input prompt for the model
 * @returns {Promise<string>} - Generated response from the model
 */
const callModel = async (model, prompt) => {
  try {
    logger.info(`Calling Ollama model: ${model}`, {
      model,
      promptLength: prompt.length,
    })

    const response = await axios.post(
      OLLAMA_BASE_URL,
      {
        model: model,
        prompt: prompt,
        stream: false,
      },
      {
        timeout: 120000, // 2 minutes timeout
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (response.data && response.data.response) {
      logger.info(`Model ${model} responded successfully`, {
        model,
        responseLength: response.data.response.length,
      })
      return response.data.response
    } else {
      throw new Error(`Invalid response format from ${model}`)
    }
  } catch (error) {
    logger.error(`Error calling Ollama model ${model}`, {
      model,
      error: error.message,
      stack: error.stack,
    })

    if (error.code === "ECONNREFUSED") {
      throw new Error("Ollama service is not running. Please start Ollama first.")
    } else if (error.code === "ETIMEDOUT") {
      throw new Error(`Timeout calling ${model}. The model might be loading.`)
    } else {
      throw new Error(`Failed to call ${model}: ${error.message}`)
    }
  }
}

/**
 * Execute the complete AI pipeline: phi3 → mistral → deepseek-coder
 * @param {string} userPrompt - Original user prompt
 * @returns {Promise<Object>} - Object containing summary, optimizedPrompt, and codeResult
 */
const executeAIPipeline = async (userPrompt) => {
  try {
    logger.info("Starting AI pipeline execution", {
      promptLength: userPrompt.length,
    })

    // Step 1: Summarize with phi3
    const summaryPrompt = `Please provide a clear and concise summary of the following request: "${userPrompt}"`
    const summary = await callModel("phi3", summaryPrompt)

    // Step 2: Optimize with mistral
    const optimizePrompt = `Transform this summary into a powerful, detailed prompt for code generation: "${summary}"`
    const optimizedPrompt = await callModel("mistral", optimizePrompt)

    // Step 3: Generate code with deepseek-coder
    const codePrompt = `Generate clean, well-commented code based on this requirement: "${optimizedPrompt}"`
    const codeResult = await callModel("deepseek-coder:6.7b", codePrompt)

    logger.info("AI pipeline completed successfully")

    return {
      summary: summary.trim(),
      optimizedPrompt: optimizedPrompt.trim(),
      codeResult: codeResult.trim(),
    }
  } catch (error) {
    logger.error("AI pipeline execution failed", {
      error: error.message,
      stack: error.stack,
    })
    throw error
  }
}

module.exports = {
  callModel,
  executeAIPipeline,
}
