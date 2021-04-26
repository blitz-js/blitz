const path = require("path")
const {pathsToModuleNameMapper} = require("ts-jest/utils")
const {getProjectRoot} = require("@blitzjs/config")
const projectRoot = getProjectRoot()
const {compilerOptions} = require(path.join(projectRoot, "tsconfig"))

const common = {
  globalSetup: path.resolve(__dirname, "./jest-preset/global-setup.js"),
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.blitz/",
    "/.next/",
    "<rootDir>/db/migrations",
    "<rootDir>/test/e2e",
    "<rootDir>/cypress",
  ],
  // This makes absolute imports work
  moduleDirectories: ["node_modules", "<rootDir>"],
  // Ignore the build directories
  modulePathIgnorePatterns: ["<rootDir>/.blitz", "<rootDir>/.next"],
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

module.exports = {
  // TODO - check on https://github.com/facebook/jest/issues/10936
  maxWorkers: 1,
  projects: [
    {
      ...common,
      name: "client",
      displayName: {
        name: "CLIENT",
        color: "cyan",
      },
      testEnvironment: "jest-environment-jsdom",
      testRegex: ["^((?!queries|mutations|api|\\.server\\.).)*\\.(test|spec)\\.(j|t)sx?$"],
      setupFilesAfterEnv: [
        path.resolve(__dirname, "./jest-preset/client/setup-after-env.js"),
        "<rootDir>/test/setup.ts",
      ],
    },
    {
      ...common,
      name: "server",
      displayName: {
        name: "SERVER",
        color: "magenta",
      },
      testEnvironment: "node",
      testRegex: [
        "\\.server\\.(spec|test)\\.(j|t)sx?$",
        "[\\/](queries|mutations|api)[\\/].*\\.(test|spec)\\.(j|t)sx?$",
      ],
      setupFilesAfterEnv: [
        path.resolve(__dirname, "./jest-preset/server/setup-after-env.js"),
        "<rootDir>/test/setup.ts",
      ],
    },
  ],
}
