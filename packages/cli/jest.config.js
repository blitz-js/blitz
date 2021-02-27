module.exports = {
  preset: "../../jest.config.js",
  // collectCoverage: !!`Boolean(process.env.CI)`,
  modulePathIgnorePatterns: ["<rootDir>/tmp", "<rootDir>/lib", "<rootDir>/.test"],
  testPathIgnorePatterns: ["src/commands/test.ts"],
  testTimeout: 30000,
}
