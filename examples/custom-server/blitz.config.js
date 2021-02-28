const {sessionMiddleware, simpleRolesIsAuthorized} = require("@blitzjs/server")
const withPreconstruct = require("@preconstruct/next")

// withPreconstruct only needed for our internal monorepo
module.exports = withPreconstruct({
  middleware: [
    sessionMiddleware({
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
  /* Uncomment this to customize the webpack config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    return config
  },
  */
})
