//@ts-nocheck
import path from "path"

export function withNextAuthAdapter(nextConfig) {
  const config = Object.assign({}, nextConfig)
  try {
    const nextAuthPath = path.dirname(require.resolve("next-auth"))
    const webpack = (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        "next-auth/core/lib/oauth/callback": path.join(nextAuthPath, "core/lib/oauth/callback.js"),
        "next-auth/core/lib/oauth/authorization-url": path.join(
          nextAuthPath,
          "core/lib/oauth/authorization-url.js",
        ),
        "next-auth/core/init": path.join(nextAuthPath, "core/init.js"),
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
  } catch (e) {
    return config
  }
}
