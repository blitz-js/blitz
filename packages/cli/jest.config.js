module.exports = {
  preset: "../../jest-unit.config.js",
  // collectCoverage: !!`Boolean(process.env.CI)`,
  modulePathIgnorePatterns: ["<rootDir>/tmp", "<rootDir>/lib", "<rootDir>/commands/.test"],
  testPathIgnorePatterns: ["src/commands/test.ts", "test/commands/.test"],
  testTimeout: 30000,
}
