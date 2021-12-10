import {log} from "@blitzjs/display"
import {NextConfigComplete} from "next/dist/server/config-shared"

export type CondegenConfig = {
  fieldTypeMap: {
    [key in string]: {
      component: string
      inputType: string
      zodType: string
      prismaType: string
      default?: string
    }
  }
}

export const fallbackCodegen: CondegenConfig = {
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
      prismaType: "String",
      default: "uuid()",
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
  resource: keyof CondegenConfig["fieldTypeMap"][string],
): Promise<string> => {
  const codegen = (await getCodegen()).codegen
  const templateValue = codegen.fieldTypeMap[fieldType][resource]
  return templateValue
}

export const getCodegen = async (): Promise<Pick<NextConfigComplete, "codegen">> => {
  try {
    const {loadConfigAtRuntime} = await import("next/dist/server/config-shared")
    const config = await loadConfigAtRuntime()

    if (config.codegen !== undefined) {
      // TODO: potentially verify that codegen is well formed using zod
      return {codegen: config.codegen}
    }
    return {codegen: fallbackCodegen}
  } catch (ex) {
    log.warning("Failed loading config from blitz.config file " + ex)
    return {codegen: fallbackCodegen}
  }
}
