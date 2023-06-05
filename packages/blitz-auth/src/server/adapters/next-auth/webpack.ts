//@ts-nocheck
import path from "path"

export function withNextAuthAdapter(nextConfig) {
  const config = Object.assign({}, nextConfig)
  const webpack = (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "next-auth/core/lib/oauth/callback": path.resolve(
        "./node_modules/next-auth/core/lib/oauth/callback.js",
      ),
      "next-auth/core/lib/oauth/authorization-url": path.resolve(
        "./node_modules/next-auth/core/lib/oauth/authorization-url.js",
      ),
      "next-auth/core/init": path.resolve("./node_modules/next-auth/core/init.js"),
    }
    return config
  }
  if (typeof nextConfig.webpack === "function") {
    config.webpack = (config, options) => {
      return nextConfig.webpack(webpack(config), options)
    }
  }
  config.webpack = webpack
  return config
}
