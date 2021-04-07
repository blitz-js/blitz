const {jsWithBabel: tsjPreset} = require("ts-jest/preset")

module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: ["<rootDir>/tmp", "<rootDir>/dist", "<rootDir>/templates"],
  moduleNameMapper: {},
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    ...tsjPreset.transform,
  },
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"],
  testMatch: ["<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}"],
  testURL: "http://localhost",
  // watchPlugins: [
  //   require.resolve("jest-watch-typeahead/filename"),
  //   require.resolve("jest-watch-typeahead/testname"),
  // ],
  coverageReporters: ["json", "lcov", "text", "clover"],
  // collectCoverage: !!`Boolean(process.env.CI)`,
  collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}"],
  coveragePathIgnorePatterns: ["/templates/"],
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // },
  globals: {
    "ts-jest": {
      tsconfig: __dirname + "/tsconfig.test.json",
      isolatedModules: true,
    },
  },
}
