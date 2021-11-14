import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz"

const config: BlitzConfig = {
  middleware: [
    sessionMiddleware({
      cookiePrefix: "i18n-next-rosetta-examples",
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
  i18n: {
    // These are all the locales you want to support
    locales: ["en", "fr"],
    // This is the default locale you want to be used when visiting
    // a path without locale prefix e.g. `/users`
    defaultLocale: "en",
  },
}
module.exports = config
