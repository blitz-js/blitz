import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz"

const config: BlitzConfig = {
  middleware: [
    sessionMiddleware({
      cookiePrefix: "__safeNameSlug__",
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
  template:{
    typeToComponentMap: {
      string: "LabeledTextField",
      uuid: "LabeledTextField",
      any: "LabeledTextField",
      int: "LabeledTextField",
      number: "LabeledTextField",
      boolean: "LabeledTextField",
    },
    typeToZodTypeMap: {
      string: "string",
      uuid: "string().uuid",
      any: "any",
      int: "number",
      number: "number",
      boolean: "boolean",
    }
  }
  /* Uncomment this to customize the webpack config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    return config
  },
  */
}
module.exports = config
