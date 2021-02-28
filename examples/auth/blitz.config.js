const {sessionMiddleware, simpleRolesIsAuthorized} = require("@blitzjs/server")
const withPreconstruct = require("@preconstruct/next")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

// withPreconstruct only needed for our internal monorepo
module.exports = withPreconstruct(
  withBundleAnalyzer({
    middleware: [
      sessionMiddleware({
        isAuthorized: simpleRolesIsAuthorized,
        // sessionExpiryMinutes: 4,
      }),
    ],
    log: {
      // level: "trace",
    },
    experimental: {
      isomorphicResolverImports: false,
    },
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
  }),
)
