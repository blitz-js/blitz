import {sessionMiddleware, simpleRolesIsAuthorized} from "blitz"
import db from "db"
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = withBundleAnalyzer({
  middleware: [
    sessionMiddleware({
      cookiePrefix: "blitz-auth-example",
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
  codegen: {
    templateDir: "./my-templates",
    fieldTypeMap: {
      string: {
        component: "LabeledTextField",
        inputType: "text",
        zodType: "string",
        prismaType: "String",
      },
      boolean: {
        component: "LabeledTextField",
        inputType: "text",
        zodType: "boolean",
        prismaType: "Boolean",
      },
      int: {
        component: "LabeledTextField",
        inputType: "number",
        zodType: "number",
        prismaType: "Int",
      },
      number: {
        component: "LabeledTextField",
        inputType: "number",
        zodType: "number",
        prismaType: "Int",
      },
      bigint: {
        component: "LabeledTextField",
        inputType: "number",
        zodType: "number",
        prismaType: "BigInt",
      },
      float: {
        component: "LabeledTextField",
        inputType: "number",
        zodType: "number",
        prismaType: "Float",
      },
      decimal: {
        component: "LabeledTextField",
        inputType: "number",
        zodType: "number",
        prismaType: "Decimal",
      },
      datetime: {
        component: "LabeledTextField",
        inputType: "string",
        zodType: "string",
        prismaType: "DateTime",
      },
      uuid: {
        component: "LabeledTextField",
        inputType: "text",
        zodType: "string().uuid",
        prismaType: "Uuid",
      },
      json: {
        component: "LabeledTextField",
        inputType: "text",
        zodType: "any",
        prismaType: "Json",
      },
    },
  },
})
