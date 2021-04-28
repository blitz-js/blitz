import {sessionMiddleware, simpleRolesIsAuthorized} from "blitz"
import db from "db"
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = withBundleAnalyzer({
  middleware: [
    sessionMiddleware({
      isAuthorized: simpleRolesIsAuthorized,
      // sessionExpiryMinutes: 4,
      getSession: (handle) => db.session.findFirst({where: {handle}}),
    }),
  ],
  cli: {
    clearConsoleOnBlitzDev: false,
  },
  log: {
    // level: "trace",
  },
  experimental: {
    initServer() {
      console.log("Hello world from initServer")
    },
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
})
