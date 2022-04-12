const nextJest = require("@blitzjs/next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
}

module.exports = createJestConfig(customJestConfig)
