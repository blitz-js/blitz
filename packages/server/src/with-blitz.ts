// We add next-transpile-modules during internal blitz development so that changes in blitz
// framework code will trigger a hot reload of any example apps that are running
const isInternalBlitzDevelopment = __dirname.includes("packages/server/src")
const withTM = require("next-transpile-modules")(["@blitzjs/core", "@blitzjs/server"])

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
            "../__db.js": "./db/index",
          })
        } else {
          config.module = config.module || {}
          config.module.rules = config.module.rules || []
          config.module.rules.push({test: /_resolvers/, use: {loader: "null-loader"}})
          config.module.rules.push({test: /@blitzjs[\\/]display/, use: {loader: "null-loader"}})
          config.module.rules.push({test: /@blitzjs[\\/]config/, use: {loader: "null-loader"}})
          config.module.rules.push({test: /@prisma[\\/]client/, use: {loader: "null-loader"}})
          config.module.rules.push({test: /passport/, use: {loader: "null-loader"}})
          config.module.rules.push({test: /cookie-session/, use: {loader: "null-loader"}})
          config.module.rules.push({
            test: /blitz[\\/]packages[\\/]config/,
            use: {loader: "null-loader"},
          })
          config.module.rules.push({
            test: /blitz[\\/]packages[\\/]display/,
            use: {loader: "null-loader"},
          })
        }

        if (typeof normalizedConfig.webpack === "function") {
          return normalizedConfig.webpack(config, options)
        }

        return config
      },
    })

    // if inside monorepo
    if (isInternalBlitzDevelopment) {
      return withTM(newConfig)
    } else {
      return newConfig
    }
  }
}
