const withPlugins = require("next-compose-plugins")
const withTM = require("next-transpile-modules")(["@blitzjs/core"])
const path = require("path")
const pkgDir = require("pkg-dir")

const projectRoot = pkgDir.sync() || process.cwd()

export function withBlitz(nextConfig: any) {
  return (phase: string, nextOpts: any = {}) => {
    // Need to grab the normalized config based on the phase we are in incase we are given a functional config to extend
    const normalizedConfig =
      typeof nextConfig === "function" ? nextConfig(phase, nextOpts) : nextConfig

    const plugins = []
    if (process.env.NODE_ENV === "development") {
      // This is needed during monorepo development so that examples auto reload when packages change
      plugins.push(withTM)
    }

    return withPlugins(
      plugins,
      Object.assign({}, normalizedConfig, {
        experimental: {
          reactMode: "concurrent",
          ...(normalizedConfig.experimental || {}),
        },
        webpack(config: any, options: Record<any, any>) {
          if (options.isServer) {
            const originalEntry = config.entry
            console.log("R:", projectRoot)
            console.log("A:", path.join(projectRoot, "_db.js"))
            console.log("B:", path.join(projectRoot, "db/index"))
            config.entry = async () => {
              console.log("HERE 1")
              const output = {
                ...(await originalEntry()),
                // [path.join(projectRoot, "_db.js")]: path.join(projectRoot, "db/index"),
              }
              console.log(JSON.stringify(output, null, 2))
              return output
            }
            // config.watchOptions = config.watchOptions || {ignored: []}
            // config.watchOptions.ignored.push("_db.js")
          } else {
            config.module = config.module || {}
            config.module.rules = config.module.rules || []
            config.module.rules.push({test: /_resolvers/, use: {loader: "null-loader"}})
            config.module.rules.push({test: /@blitzjs[\\/]display/, use: {loader: "null-loader"}})
            config.module.rules.push({test: /@blitzjs[\\/]config/, use: {loader: "null-loader"}})
            config.module.rules.push({test: /@prisma[\\/]client/, use: {loader: "null-loader"}})
            config.module.rules.push({
              test: /blitz[\\/]packages[\\/]config/,
              use: {loader: "null-loader"},
            })
            config.module.rules.push({
              test: /blitz[\\/]packages[\\/]display/,
              use: {loader: "null-loader"},
            })
          }

          // This is needed because, for an unknown reason, the next build fails when
          // importing directly from the `blitz` package, complaining about child_process
          // Somehow our server code is getting into the next build that way.
          // This alias eliminates that problem.
          // Anyone is welcome to investigate this further sometime
          config.resolve.alias.blitz = "@blitzjs/core"

          if (typeof normalizedConfig.webpack === "function") {
            return normalizedConfig.webpack(config, options)
          }

          return config
        },
      }),
    )(phase, nextOpts)
  }
}
