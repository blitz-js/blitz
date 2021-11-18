import {Editor} from "mem-fs-editor"
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

export interface ResourceGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  rawParentModelName?: string
  parentModel?: string
  parentModels?: string
  ParentModel?: string
  ParentModels?: string
  extraArgs?: string[]
}

export interface CommonTemplateValues {
  parentModelId: string
  parentModelParam: string
  parentModel?: string
  parentModels?: string
  ParentModel?: string
  ParentModels?: string
  parentModelIdZodType?: string
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
  zodType: string
  FieldComponent: string
  fieldName: string
  FieldName: string
  field_name: string
  Field_name: string
  Field_Name: string
}

export abstract class Builder<T, U> implements IBuilder<T, U> {
  public constructor(fs?: Editor) {
    this.fs = fs
  }

  abstract getTemplateValues(Options: T): Promise<U>

  public fs: Editor | undefined

  public fallbacks: {[key in string]: string} = {
    component: "LabeledTextField",
    inputType: "text",
    zodType: "string",
    prismaType: "String",
  }

  public getId(input: string = "") {
    if (!input) return input
    return `${input}Id`
  }

  public getParam(input: string = "") {
    if (!input) return input
    return `[${input}]`
  }

  public async getResourceValueFromConfig(fieldType: string, resource: string): Promise<string> {
    let templateValue = ""
    try {
      let config = await this.getCachedConfig()
      templateValue = config.codegen.fieldTypeMap[fieldType][resource]
    } catch (ex) {
      templateValue = this.fallbacks[resource]
    }
    return templateValue
  }

  public getModelNamesPath(context: string | undefined, modelNames: string) {
    const kebabCaseContext = context ? `${camelCaseToKebabCase(context)}/` : ""
    const kebabCaseModelNames = camelCaseToKebabCase(modelNames)
    return kebabCaseContext + kebabCaseModelNames
  }

  // eslint-disable-next-line require-await
  public async getZodType(type: string = "") {
    return this.getResourceValueFromConfig(type, "zodType")
  }

  // eslint-disable-next-line require-await
  public async getComponentForType(type: string = ""): Promise<string> {
    return this.getResourceValueFromConfig(type, "component")
  }
  
  // eslint-disable-next-line require-await
  public async getInputType(type: string = ""): Promise<string> {
    return this.getResourceValueFromConfig(type, "inputType")
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
        zodType: await this.getZodType(typeName),
        inputType: await this.getInputType(typeName),
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
