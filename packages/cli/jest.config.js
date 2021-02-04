module.exports = {
  preset: "../../jest.config.js",
  // collectCoverage: !!`Boolean(process.env.CI)`,
  modulePathIgnorePatterns: ["<rootDir>/tmp", "<rootDir>/lib"],
  testPathIgnorePatterns: ["src/commands/test.ts"],
  testTimeout: 30000,
  globals: {
    "ts-jest": {
      tsconfig: "test/tsconfig.json",
      isolatedModules: true,
    },
  },
}
