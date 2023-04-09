import type { BlitzCliConfig } from "blitz"
import { BlitzLogger } from "blitz"
import { setupBlitzServer } from "@blitzjs/next"
import { AuthServerPlugin, PrismaStorage, simpleRolesIsAuthorized } from "@blitzjs/auth"
import db from "db"

export const cliConfig: BlitzCliConfig = {
  customTemplates: "src/templates",
  codegen: {
    fieldTypeMap: {
      string: {
        component: "LabeledTextField",
        inputType: "text",
        zodType: "date",
        prismaType: "String",
      },
    },
  },
}

const { gSSP, gSP, api } = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "web-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
  formatError: (error) => {
    return new Error("Formatted error" + error.message)
  },
  logger: BlitzLogger({}),
})

export { gSSP, gSP, api }
