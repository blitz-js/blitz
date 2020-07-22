const {sessionMiddleware, unstable_simpleRolesIsAuthorized} = require("@blitzjs/server")

module.exports = {
  middleware: [
    sessionMiddleware({
      unstable_isAuthorized: unstable_simpleRolesIsAuthorized,
    }),
  ],
  /*
  webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    return config
  },
  webpackDevMiddleware: (config) => {
    // Perform customizations to webpack dev middleware config
    // Important: return the modified config
    return config
  },
  */
}
