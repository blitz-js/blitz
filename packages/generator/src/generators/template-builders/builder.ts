import {NextConfigComplete} from "next/dist/server/config-shared"
import {GeneratorOptions} from "../../generator"
import {
  addSpaceBeforeCapitals,
  camelCaseToKebabCase,
  singleCamel,
  singlePascal,
} from "../../utils/inflector"

export interface IBuilder<T, U> {
  getTemplateValues(Options: T): Promise<U>
}

export interface FieldGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  parentModel?: string
  parentModels?: string
  ParentModel?: string
  ParentModels?: string
  extraArgs?: string[]
}
export interface CommonTemplateValues {
  parentModelId: string
  parentModelIdZodType: string
  parentModelParam: string
  parentModel?: string
  parentModels?: string
  ParentModel?: string
  ParentModels?: string
  modelId: string
  modelIdZodType: string
  modelIdParam: string
  modelName: string
  modelNames: string
  ModelName: string
  ModelNames: string
  modelNamesPath: string
  fieldTemplateValues?: FieldTemplateValues[]
}

export interface FieldTemplateValues {
  attributeName: string
  zodTypeName: string
  FieldComponent: string
  fieldName: string
  FieldName: string
  field_name: string
  Field_name: string
  Field_Name: string
}

export abstract class Builder<T, U> implements IBuilder<T, U> {
  abstract getTemplateValues(Options: T): Promise<U>

  public fallbackMap = {
    string: "LabeledTextField",
    number: "LabeledTextField",
    int: "LabeledTextField",
    boolean: "LabeledTextField",
  }

  public fallbackZodMap = {
    string: "string",
    number: "number",
    boolean: "boolean",
    uuid: "string",
    int: "number",
  }

  public getId(input: string = "") {
    if (!input) return input
    return `${input}Id`
  }

  public getParam(input: string = "") {
    if (!input) return input
    return `[${input}]`
  }

  public getModelNamesPath(context: string | undefined, modelNames: string) {
    const kebabCaseContext = context ? `${camelCaseToKebabCase(context)}/` : ""
    const kebabCaseModelNames = camelCaseToKebabCase(modelNames)
    return kebabCaseContext + kebabCaseModelNames
  }

  public async getZodTypeName(type: string = "") {
    let typeToZodNameMap: {[key: string]: string} = this.fallbackZodMap

    let config = await this.getCachedConfig()
    if (config.template && config.template.typeToZodTypeMap) {
      typeToZodNameMap = config.template.typeToZodTypeMap
    }

    let defaultName = "any"

    return typeToZodNameMap[type] ?? defaultName
  }

  public async getComponentForType(type: string = ""): Promise<string> {
    let typeToComponentMap: {[key: string]: string} = this.fallbackMap
    let config = await this.getCachedConfig()
    if (config.template && config.template.typeToComponentMap) {
      typeToComponentMap = config.template.typeToComponentMap
    }

    let defaultComponent = typeToComponentMap["string"]

    return typeToComponentMap[type] ?? defaultComponent
  }

  private config: NextConfigComplete | undefined = undefined

  public async getCachedConfig(): Promise<NextConfigComplete> {
    if (!this.config) {
      const {loadConfigAtRuntime} = await import("next/dist/server/config-shared")
      this.config = await loadConfigAtRuntime()
    }

    return this.config
  }

  // eslint-disable-next-line require-await
  public async getFieldTemplateValues(args: string[]) {
    const argsPromises = args.map(async (arg: string) => {
      const [valueName, typeName] = arg.split(":")
      const values = {
        attributeName: singleCamel(valueName),
        zodTypeName: await this.getZodTypeName(typeName),
        FieldComponent: await this.getComponentForType(typeName), // get component based on type. TODO: Override argument 3?
        fieldName: singleCamel(valueName), // fieldName
        FieldName: singlePascal(valueName), // FieldName
        field_name: addSpaceBeforeCapitals(valueName).toLocaleLowerCase(), // field name
        Field_name: singlePascal(addSpaceBeforeCapitals(valueName).toLocaleLowerCase()), // Field name
        Field_Name: singlePascal(addSpaceBeforeCapitals(valueName)), // Field Name
      }

      return values
    })
    return Promise.all(argsPromises)
  }
}
