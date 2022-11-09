const nextJest = require("@blitzjs/next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

module.exports = createJestConfig(customJestConfig)
