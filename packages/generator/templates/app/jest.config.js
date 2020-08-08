module.exports = {
  // Test setup file
  setupFilesAfterEnv: ["./jest.setup.js"],
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom-fourteen",
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/.blitz/", "/.next/", "<rootDir>/db/migrations"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$"],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png|jpg|jpeg)$": "<rootDir>/test/__mocks__/fileMock.js",
  },
  watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
  // Coverage output
  coverageDirectory: ".coverage",
  collectCoverageFrom: ["**/*.{js,jsx,ts,tsx}", "!**/*.d.ts", "!**/node_modules/**"],
}
