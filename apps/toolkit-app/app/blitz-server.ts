import { setupBlitzServer } from "@blitzjs/next"
import { AuthServerPlugin, PrismaStorage } from "@blitzjs/auth"
import db from "db"
import { simpleRolesIsAuthorized } from "@blitzjs/auth"

const { gSSP, gSP, api } = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "web-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

export { gSSP, gSP, api }

export const cliConfig = {
  codegen: {
    fieldTypeMap: {
      string: {
        component: "LabeledTextField",
        inputType: "text",
        zodType: "any",
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
}
