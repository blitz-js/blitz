module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Coverage output
  coverageDirectory: '.coverage',
  // Test setup file
  setupFilesAfterEnv: ['./jest.setup.js'],
  roots: [
    "<rootDir>/app"
  ],
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts"
  ],
  testMatch: [
    "<rootDir>/app/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/app/**/*.{spec,test}.{js,jsx,ts,tsx}"
  ],
  testEnvironment: "jest-environment-jsdom-fourteen",
  modulePaths: [],
  moduleFileExtensions: [
    "web.js",
    "js",
    "web.ts",
    "ts",
    "web.tsx",
    "tsx",
    "json",
    "web.jsx",
    "jsx",
    "node"
  ],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname"
  ]
};
