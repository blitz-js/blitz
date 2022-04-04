const nextJest = require("next/jest")
const path = require("path")
const fs = require("fs")
const {pathsToModuleNameMapper} = require("ts-jest")

let tsConfig = null
const tsConfigPath = path.join("<rootDir>", "tsconfig.json")
if (fs.existsSync(tsConfigPath)) {
  tsConfig = require(tsConfigPath)
}

const createJestConfig = nextJest({
  dir: "<rootDir>",
})

const common = {
  globalSetup: path.resolve(__dirname, "./jest-preset/global-setup.js"),
  // This makes absolute imports work
  moduleDirectories: ["node_modules", "<rootDir>"],
  // Ignore the build directories
  moduleNameMapper: {
    // This ensures any path aliases in tsconfig also work in jest
    ...pathsToModuleNameMapper(
      (tsConfig && tsConfig.compilerOptions && tsConfig.compilerOptions.paths) || {},
    ),
    "\\.(jpg|jpeg|png|gif|webp|ico)$": path.resolve(__dirname, "./jest-preset/image-mock.js"),
  },
}

module.exports = createJestConfig({
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
})
