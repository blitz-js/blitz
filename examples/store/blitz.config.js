module.exports = {
  // Express/Connect compatible
  middleware: [
    async (req, res, next) => {
      res.blitzCtx.referer = req.headers.referer
      console.log("header middleware before")
      await next()
      console.log("header middleware after")
    },
  ],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
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
}
