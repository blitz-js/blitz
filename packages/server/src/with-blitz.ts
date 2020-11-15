import fs from "fs"
import path from "path"
import pkgDir from "pkg-dir"

export function withBlitz(nextConfig: any) {
  return (phase: string, nextOpts: any = {}) => {
    // Need to grab the normalized config based on the phase
    // we are in incase we are given a functional config to extend
    const normalizedConfig =
      typeof nextConfig === "function" ? nextConfig(phase, nextOpts) : nextConfig

    const newConfig = Object.assign({}, normalizedConfig, {
      experimental: {
        reactMode: "concurrent",
        ...(normalizedConfig.experimental || {}),
      },
      webpack(config: any, options: Record<any, any>) {
        if (options.isServer) {
          const originalEntry = config.entry
          config.entry = async () => ({
            ...(await originalEntry()),
            ...(doesDbModuleExist() ? {"../__db": "./db/index"} : {}),
          })
        } else {
          config.module = config.module || {}
          config.module.rules = config.module.rules || []
          const excluded = [
            /db/,
            /@blitzjs[\\/]display/,
            /@blitzjs[\\/]config/,
            /@prisma[\\/]client/,
            /passport/,
            /cookie-session/,
            /blitz[\\/]packages[\\/]config/,
            /blitz[\\/]packages[\\/]display/,
          ]
          excluded.forEach((excluded) => {
            config.module.rules.push({test: excluded, use: {loader: "null-loader"}})
          })

          config.module.rules.push({
            issuer: /mutations|queries/,
            resource: /_resolvers/,
            use: {loader: "null-loader"},
          })
        }

        if (typeof normalizedConfig.webpack === "function") {
          return normalizedConfig.webpack(config, options)
        }

        return config
      },
    })

    function doesDbModuleExist() {
      const projectRoot = pkgDir.sync() || process.cwd()
      return (
        fs.existsSync(path.join(projectRoot, "db/index.js")) ||
        fs.existsSync(path.join(projectRoot, "db/index.ts")) ||
        fs.existsSync(path.join(projectRoot, "db/index.tsx"))
      )
    }

    // We add next-transpile-modules during internal blitz development so that changes in blitz
    // framework code will trigger a hot reload of any example apps that are running
    const isInternalBlitzDevelopment = __dirname.includes("packages/server/src")
    if (isInternalBlitzDevelopment) {
      const withTM = require("next-transpile-modules")(["@blitzjs/core", "@blitzjs/server"])
      return withTM(newConfig)
    } else {
      return newConfig
    }
  }
}
