import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz"

const config: BlitzConfig = {
  middleware: [
    sessionMiddleware({
      cookiePrefix: "__safeNameSlug__",
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
  codegen:{
    fieldTypeMap: {
      string: {
        component: "LabeledTextField",
        inputType: "text",
        zodType: "string",
        prismaType: "String"
      },
      boolean: {
        component: "LabeledTextField",
        inputType: "text",
        zodType: "boolean",
        prismaType: "Boolean"
      },
      int: {
        component: "LabeledTextField",
        inputType: "number",
        zodType: "number",
        prismaType: "Int"
      },
      bigint: {
        component: "LabeledTextField",
        inputType: "number",
        zodType: "number",
        prismaType: "BigInt"
      },
      float: {
        component: "LabeledTextField",
        inputType: "number",
        zodType: "number",
        prismaType: "Float"
      },
      decimal: {
        component: "LabeledTextField",
        inputType: "number",
        zodType: "number",
        prismaType: "Decimal"
      },
      datetime: {
        component: "LabeledTextField",
        inputType: "string",
        zodType: "string",
        prismaType: "DateTime"
      },
      uuid: {
        component: "LabeledTextField",
        inputType: "text",
        zodType: "string().uuid",
        prismaType: "String"
      },
      json: {
        component: "LabeledTextField",
        inputType: "text",
        zodType: "any",
        prismaType: "Json"
      }
    },
  }
}
module.exports = config
