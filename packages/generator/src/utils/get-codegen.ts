import {CodegenConfig, NextConfigComplete} from "next/dist/server/config-shared"
import {baseLogger} from "next/dist/server/lib/logging"

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
  fieldType: keyof CodegenConfig["fieldTypeMap"],
  resource: keyof CodegenConfig["fieldTypeMap"][string],
): Promise<string | undefined> => {
  const codegen = (await getCodegen()).codegen as CodegenConfig
  const templateValue = codegen.fieldTypeMap[fieldType][resource]
  return templateValue
}

export const getResourceConfigFromCodegen = async (
  fieldType: keyof CodegenConfig["fieldTypeMap"],
): Promise<CodegenConfig["fieldTypeMap"][string]> => {
  const codegen = (await getCodegen()).codegen as CodegenConfig
  const config = codegen.fieldTypeMap[fieldType] || {}
  return config
}

export const getCodegen = async (): Promise<Pick<NextConfigComplete, "codegen">> => {
  try {
    const {loadConfigAtRuntime} = await import("next/dist/server/config-shared")
    const config = await loadConfigAtRuntime()

    if (config.codegen !== undefined) {
      // TODO: potentially verify that codegen is well formed using zod
      return {codegen: config.codegen}
    }
    return {codegen: defaultCodegenConfig}
  } catch (ex) {
    baseLogger({displayDateTime: false}).warn("Failed loading config from blitz.config file " + ex)
    return {codegen: defaultCodegenConfig}
  }
}
