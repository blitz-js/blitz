/* eslint-disable es5/no-es6-methods  -- file only used on the server */
import {getProjectRoot} from "@blitzjs/config"
import fs from "fs"
import path from "path"

export function withBlitz(nextConfig: any) {
  return (phase: string, nextOpts: any = {}) => {
    // Need to grab the normalized config based on the phase
    // we are in incase we are given a functional config to extend
    const normalizedConfig =
      typeof nextConfig === "function" ? nextConfig(phase, nextOpts) : nextConfig

    const experimental = {
      ...normalizedConfig.experimental,
    }
    if (experimental.reactMode === undefined && experimental.reactRoot === undefined) {
      // Default to true
      experimental.reactRoot = true
    }

    const newConfig = Object.assign({}, normalizedConfig, {
      experimental,
      webpack(config: any, options: {isServer: boolean; webpack: any}) {
        // ----------------------
        // Set up resolve aliases
        // ----------------------
        // config.resolve ??= {}
        // config.resolve.alias ??= {}
        // for (const [from, to] of Object.entries(resolveAliases.webpack)) {
        //   config.resolve.alias[from] = to
        // }

        if (options.isServer) {
          const originalEntry = config.entry
          config.entry = async () => ({
            ...(await originalEntry()),
            ...(doesDbModuleExist() ? {"../blitz/db": "./db/index"} : {}),
          })
        } else {
          config.module = config.module ?? {}
          config.module.rules = config.module.rules ?? []
          const excluded = [
            /[\\/]npm-which[\\/]/,
            /[\\/]cross-spawn[\\/]/,
            /@blitzjs[\\/]config/,
            /blitz[\\/]packages[\\/]config/,
            /blitz2[\\/]packages[\\/]config/,
          ]
          excluded.forEach((excluded) => {
            config.module.rules.push({test: excluded, use: {loader: "null-loader"}})
          })

          if (normalizedConfig.experimental?.isomorphicResolverImports) {
            config.module.rules.push({
              test: /@blitzjs[\\/]core[\\/]server/,
              use: {loader: "null-loader"},
            })
            config.module.rules.push({
              test: /blitz[\\/]packages[\\/]core[\\/]server/,
              use: {loader: "null-loader"},
            })

            config.plugins.push(
              new options.webpack.NormalModuleReplacementPlugin(
                /[/\\]?(mutations|queries)[/\\]/,
                (resource: any) => {
                  const request = resource.request as string
                  if (request.includes("_resolvers")) {
                    return
                  }

                  if (
                    request.endsWith(".js") ||
                    request.endsWith(".ts") ||
                    request.endsWith(".jsx") ||
                    request.endsWith(".tsx")
                  ) {
                    return
                  }

                  resource.request = resource.request + ".client"
                },
              ),
            )
          } else {
            config.module.rules.push({
              issuer: /(mutations|queries)(?!.*\.client)/,
              resource: /_resolvers/,
              use: {loader: "null-loader"},
            })
          }
        }

        if (typeof normalizedConfig.webpack === "function") {
          return normalizedConfig.webpack(config, options)
        }

        return config
      },
    })

    function doesDbModuleExist() {
      const projectRoot = getProjectRoot()
      return (
        fs.existsSync(path.join(projectRoot, "db/index.js")) ||
        fs.existsSync(path.join(projectRoot, "db/index.ts")) ||
        fs.existsSync(path.join(projectRoot, "db/index.tsx"))
      )
    }

    return newConfig
  }
}
