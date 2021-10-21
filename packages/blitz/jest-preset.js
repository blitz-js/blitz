const path = require("path")
const fs = require("fs")
const {pathsToModuleNameMapper} = require("ts-jest/utils")
const {getProjectRootSync} = require("next/dist/server/lib/utils")
const projectRoot = getProjectRootSync()

let tsConfig = null
const tsConfigPath = path.join(projectRoot, "tsconfig.json")
if (fs.existsSync(tsConfigPath)) {
  tsConfig = require(tsConfigPath)
}

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
    ...pathsToModuleNameMapper(
      (tsConfig && tsConfig.compilerOptions && tsConfig.compilerOptions.paths) || {},
    ),
    "\\.(css|less|sass|scss)$": path.resolve(__dirname, "./jest-preset/identity-obj-proxy.js"),
    "\\.(eot|otf|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": path.resolve(
      __dirname,
      "./jest-preset/file-mock.js",
    ),
    "\\.(jpg|jpeg|png|gif|webp|ico)$": path.resolve(__dirname, "./jest-preset/image-mock.js"),
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
        `<rootDir>/test/setup.${tsConfig ? "ts" : "js"}`,
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
        `<rootDir>/test/setup.${tsConfig ? "ts" : "js"}`,
      ],
    },
  ],
}
