import {log} from "../utils/log"

export type CodegenField = {
  component: string
  inputType: string
  zodType: string
  prismaType: string
  default?: string
  [index: string]: string | undefined
}

export type CodegenConfig = {
  templateDir?: string
  fieldTypeMap?: Record<string, CodegenField>
}

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
      zodType: "string",
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
    const blitzServerPath = isTypeScript ? "app/blitz-server.ts" : "app/blitz-server.js"
    const blitzServer = require("path").join(process.cwd(), blitzServerPath)
    const {register} = require("esbuild-register/dist/node")
    const {unregister} = register({
      target: "es6",
    })
    const blitzConfig = require(blitzServer)
    const config = blitzConfig?.codegen
    unregister()

    if (config.codegen !== undefined) {
      // TODO: potentially verify that codegen is well formed using zod
      return config.codegen
    }
    return defaultCodegenConfig
  } catch (ex) {
    log.debug("Failed loading config" + ex)
    return defaultCodegenConfig
  }
}
