const path = require("path")
const pkgDir = require("pkg-dir")
const {pathsToModuleNameMapper} = require("ts-jest/utils")
const projectRoot = pkgDir.sync() || process.cwd()
const {compilerOptions} = require(path.join(projectRoot, "tsconfig"))

module.exports = {
  maxWorkers: 1,
  globalSetup: path.resolve(__dirname, "./jest-preset/global-setup.js"),
  setupFilesAfterEnv: [
    path.resolve(__dirname, "./jest-preset/setup-after-env.js"),
    "<rootDir>/test/setup.ts",
  ],
  // Add type checking to Typescript test files
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom-fourteen",
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/.blitz/", "/.next/", "<rootDir>/db/migrations"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$"],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  // This makes absolute imports work
  moduleDirectories: ["node_modules", "<rootDir>"],
  // Ignore the build directories
  modulePathIgnorePatterns: [
    "<rootDir>/.blitz",
    "<rootDir>/.next",
    "<rootDir>/test/e2e",
    "<rootDir>/cypress",
  ],
  moduleNameMapper: {
    // This ensures any path aliases in tsconfig also work in jest
    ...pathsToModuleNameMapper(compilerOptions.paths || {}),
    "\\.(css|less|sass|scss)$": path.resolve(__dirname, "./jest-preset/identity-obj-proxy.js"),
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": path.resolve(
      __dirname,
      "./jest-preset/file-mock.js",
    ),
  },
  watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
  // Coverage output
  coverageDirectory: ".coverage",
  collectCoverageFrom: ["**/*.{js,jsx,ts,tsx}", "!**/*.d.ts", "!**/node_modules/**"],
}
