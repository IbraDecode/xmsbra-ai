const { Sequelize } = require("sequelize")
const path = require("path")
const logger = require("../utils/logger")

// Database path from environment or default
const dbPath = process.env.DB_PATH || path.join(__dirname, "../database.sqlite")

/**
 * Initialize SQLite database connection
 */
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: (msg) => logger.info("Database query", { query: msg }),
})

/**
 * Test database connection and sync models
 */
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate()
    logger.info("Database connection established successfully")

    // Import and sync models
    const Conversation = require("./conversation")

    await sequelize.sync({ alter: true })
    logger.info("Database models synchronized")
  } catch (error) {
    logger.error("Unable to connect to database", { error: error.message })
    process.exit(1)
  }
}

// Initialize database
initializeDatabase()

module.exports = sequelize
