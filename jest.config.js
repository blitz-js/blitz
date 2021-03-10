const {resolveAliases} = require("@blitzjs/config")

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  modulePathIgnorePatterns: ["<rootDir>/tmp", "<rootDir>/dist", "<rootDir>/templates"],
  moduleNameMapper: {
    ...(resolveAliases && resolveAliases.node),
  },
  coverageReporters: ["json", "lcov", "text", "clover"],
  // collectCoverage: !!`Boolean(process.env.CI)`,
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: ["/templates/"],
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // },
}
