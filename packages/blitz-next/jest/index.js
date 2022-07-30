const nextJest = require("next/jest")
const path = require("path")
const fs = require("fs")
const {pathsToModuleNameMapper} = require("ts-jest")

let tsConfig = null
const tsConfigPath = path.join(process.cwd(), "tsconfig.json")
if (fs.existsSync(tsConfigPath)) {
  tsConfig = require(tsConfigPath)
}

function createJestConfigForNext(options) {
  const createJestConfig = nextJest(options)

  return async function (customConfig) {
    const createCommonConfig = await createJestConfig({
      // This makes absolute imports work
      moduleDirectories: ["node_modules", "<rootDir>"],
      // Ignore the build directories
      moduleNameMapper: {
        // This ensures any path aliases in tsconfig also work in jest
        ...pathsToModuleNameMapper(
          (tsConfig && tsConfig.compilerOptions && tsConfig.compilerOptions.paths) || {},
          {prefix: "<rootDir>/"},
        ),
        "\\.(jpg|jpeg|png|gif|webp|ico)$": path.resolve(__dirname, "./jest-preset/image-mock.js"),
      },
    })
    const common = await createCommonConfig()

    const config = {
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
            path.resolve(__dirname, "./client/setup-after-env.js"),
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
            path.resolve(__dirname, "./server/setup-after-env.js"),
            `<rootDir>/test/setup.${tsConfig ? "ts" : "js"}`,
          ],
        },
      ],
    }

    return createJestConfig({...config, ...customConfig})
  }
}

module.exports = createJestConfigForNext
