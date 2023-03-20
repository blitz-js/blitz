import {log} from "../utils/log"
import * as z from "zod"

export type CodegenField = {
  component: string
  inputType: string
  zodType: string
  prismaType: string
  default?: string
}

export type CodegenConfig = {
  fieldTypeMap?: Record<
    | "string"
    | "boolean"
    | "int"
    | "number"
    | "bigint"
    | "float"
    | "decimal"
    | "datetime"
    | "uuid"
    | "json",
    CodegenField
  >
}

const CodegenSchema = z.object({
  fieldTypeMap: z.record(
    z.union([
      z.literal("string"),
      z.literal("boolean"),
      z.literal("int"),
      z.literal("number"),
      z.literal("bigint"),
      z.literal("float"),
      z.literal("decimal"),
      z.literal("datetime"),
      z.literal("uuid"),
      z.literal("json"),
    ]),
    z.object({
      component: z.string(),
      inputType: z.string(),
      zodType: z.string(),
      prismaType: z.string(),
      default: z.string().optional(),
    }),
  ),
})

export const defaultCodegenConfig: CodegenConfig = {
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
      inputType: "text",
      zodType: "string().datetime()",
      prismaType: "DateTime",
    },
    uuid: {
      component: "LabeledTextField",
      inputType: "text",
      zodType: "string().uuid",
      prismaType: "String",
      default: "uuid",
    },
    json: {
      component: "LabeledTextField",
      inputType: "text",
      zodType: "any",
      prismaType: "Json",
    },
  },
}

export const getResourceValueFromCodegen = async (
  fieldType: string,
  resource: keyof CodegenField,
): Promise<string | undefined> => {
  const codegen = await getCodegen()
  const templateValue = codegen.fieldTypeMap?.[fieldType]?.[resource]
  return templateValue
}

export const getResourceConfigFromCodegen = async (
  fieldType: string,
): Promise<CodegenField | undefined> => {
  const codegen = await getCodegen()
  const config = codegen.fieldTypeMap?.[fieldType]
  return config
}

const getIsTypeScript = async () =>
  require("fs").existsSync(require("path").join(process.cwd(), "tsconfig.json"))

export const getCodegen = async () => {
  try {
    const isTypeScript = await getIsTypeScript()
    const blitzServerPath = isTypeScript ? "src/blitz-server.ts" : "src/blitz-server.js"
    const blitzServer = require("path").join(process.cwd(), blitzServerPath)
    const {register} = require("esbuild-register/dist/node")
    const {unregister} = register({
      target: "es6",
    })
    const blitzConfig = require(blitzServer)
    const config = blitzConfig
    const {cliConfig} = config
    unregister()

    const _config = {...defaultCodegenConfig.fieldTypeMap, ...cliConfig.codegen.fieldTypeMap}
    const combined = {
      fieldTypeMap: _config,
    }
    console.log("_config", combined)

    if (cliConfig.codegen !== undefined) {
      const result = CodegenSchema.safeParse(combined)
      if (!result.success) {
        log.error("Failed parsing codegen config. Check if it is well formed. Using default config")
        return defaultCodegenConfig
      }
      return combined
    }
    return defaultCodegenConfig
  } catch (ex) {
    log.debug("Failed loading config" + ex)
    return defaultCodegenConfig
  }
}
