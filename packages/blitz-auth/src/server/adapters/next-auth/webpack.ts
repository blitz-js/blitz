//@ts-nocheck
export function withNextAuthAdapter(nextConfig) {
  const config = Object.assign({}, nextConfig)
  config.webpack = (config) => {
    //add a required resolve alias
    config.resolve.alias["next-auth/core/lib/oauth/callback"] =
      process.cwd() + "/node_modules/next-auth/core/lib/oauth/callback.js"
    config.resolve.alias["next-auth/core/lib/oauth/authorization-url"] =
      process.cwd() + "/node_modules/next-auth/core/lib/oauth/authorization-url.js"
    config.resolve.alias["next-auth/core/init"] =
      process.cwd() + "/node_modules/next-auth/core/init.js"
    return config
  }
  return config
}
