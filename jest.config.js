module.exports = {
  testMatch: ["**/*.test.js", "**/*.test.ts"],
  verbose: true,
  rootDir: "test",
  modulePaths: ["<rootDir>/lib"],
  moduleNameMapper: {
    "^lib/(.+)$": "<rootDir>/lib/$1",
  },
  globalSetup: "<rootDir>/jest-global-setup.js",
  globalTeardown: "<rootDir>/jest-global-teardown.js",
  setupFilesAfterEnv: ["<rootDir>/jest-setup-after-env.js"],
  testEnvironment: "<rootDir>/jest-environment.js",
}
