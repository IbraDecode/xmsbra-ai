// XMsbra AI Frontend Script
// Handles form submission and API communication

const API_KEY = "gratisyakocak" // API Key untuk testing
const API_ENDPOINT = "/api/xmsbra/ibradecodeprojects"

// DOM Elements
const promptForm = document.getElementById("promptForm")
const promptInput = document.getElementById("promptInput")
const submitBtn = document.getElementById("submitBtn")
const loading = document.getElementById("loading")
const results = document.getElementById("results")
const summaryResult = document.getElementById("summaryResult")
const optimizedResult = document.getElementById("optimizedResult")
const codeResult = document.getElementById("codeResult")

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
  // Remove existing error messages
  const existingError = document.querySelector(".error")
  if (existingError) {
    existingError.remove()
  }

  // Create and show new error message
  const errorDiv = document.createElement("div")
  errorDiv.className = "error"
  errorDiv.innerHTML = `
        <strong>❌ Error:</strong> ${message}
    `

  // Insert error message before results section
  results.parentNode.insertBefore(errorDiv, results)

  // Auto-hide error after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove()
    }
  }, 10000)
}

/**
 * Show loading state
 */
function showLoading() {
  loading.style.display = "block"
  results.style.display = "none"
  submitBtn.disabled = true
  submitBtn.textContent = "⏳ Memproses..."

  // Remove any existing error messages
  const existingError = document.querySelector(".error")
  if (existingError) {
    existingError.remove()
  }
}

/**
 * Hide loading state
 */
function hideLoading() {
  loading.style.display = "none"
  submitBtn.disabled = false
  submitBtn.textContent = "🚀 Kirim ke XMsbra AI"
}

/**
 * Display API results
 * @param {Object} data - API response data
 */
function displayResults(data) {
  summaryResult.textContent = data.summary || "Tidak ada summary"
  optimizedResult.textContent = data.optimizedPrompt || "Tidak ada optimized prompt"
  codeResult.textContent = data.codeResult || "Tidak ada code result"

  results.style.display = "block"

  // Smooth scroll to results
  results.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

/**
 * Send prompt to XMsbra AI API
 * @param {string} prompt - User prompt
 */
async function sendPrompt(prompt) {
  try {
    showLoading()

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    if (data.status === 200 && data.data) {
      displayResults(data.data)
      console.log("✅ API Response:", data)
    } else {
      throw new Error("Invalid response format from API")
    }
  } catch (error) {
    console.error("❌ API Error:", error)

    // Handle specific error types
    let errorMessage = error.message

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorMessage = "Tidak dapat terhubung ke server. Pastikan server berjalan."
    } else if (error.message.includes("401")) {
      errorMessage = "API key tidak valid. Silakan periksa konfigurasi."
    } else if (error.message.includes("429")) {
      errorMessage = "Terlalu banyak request. Silakan tunggu sebentar dan coba lagi."
    } else if (error.message.includes("503")) {
      errorMessage = "Layanan AI sedang tidak tersedia. Pastikan Ollama berjalan."
    } else if (error.message.includes("504")) {
      errorMessage = "Request timeout. Model AI sedang memproses, silakan coba lagi."
    }

    showError(errorMessage)
  } finally {
    hideLoading()
  }
}

/**
 * Handle form submission
 */
promptForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const prompt = promptInput.value.trim()

  // Validate input
  if (!prompt) {
    showError("Silakan masukkan prompt terlebih dahulu.")
    promptInput.focus()
    return
  }

  if (prompt.length > 5000) {
    showError("Prompt terlalu panjang. Maksimal 5000 karakter.")
    promptInput.focus()
    return
  }

  // Send to API
  await sendPrompt(prompt)
})

/**
 * Auto-resize textarea based on content
 */
promptInput.addEventListener("input", function () {
  this.style.height = "auto"
  this.style.height = Math.min(this.scrollHeight, 300) + "px"
})

/**
 * Add keyboard shortcut (Ctrl+Enter) to submit form
 */
promptInput.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault()
    promptForm.dispatchEvent(new Event("submit"))
  }
})

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 XMsbra AI Frontend loaded")
  console.log("💡 Tip: Gunakan Ctrl+Enter untuk submit cepat")

  // Focus on input
  promptInput.focus()

  // Add placeholder examples
  const examples = [
    "Buatkan fungsi JavaScript untuk menghitung faktorial dengan rekursi",
    "Buat class Python untuk mengelola database SQLite",
    "Buatkan API REST dengan Express.js untuk CRUD user",
    "Buat komponen React untuk form login dengan validasi",
    "Buatkan algoritma sorting bubble sort dalam bahasa C++",
  ]

  let exampleIndex = 0
  setInterval(() => {
    if (promptInput.value === "" && document.activeElement !== promptInput) {
      promptInput.placeholder = `Contoh: ${examples[exampleIndex]}...`
      exampleIndex = (exampleIndex + 1) % examples.length
    }
  }, 3000)
})
