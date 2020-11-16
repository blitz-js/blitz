const {sessionMiddleware, unstable_simpleRolesIsAuthorized} = require("@blitzjs/server")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = withBundleAnalyzer({
  sitemap: [{uri: "/wow", type: "pages", verb: "get"}],
  middleware: [
    sessionMiddleware({
      unstable_isAuthorized: unstable_simpleRolesIsAuthorized,
      sessionExpiryMinutes: 4,
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
})
