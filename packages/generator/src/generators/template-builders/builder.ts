import {GeneratorOptions} from "../../generator"
import {addSpaceBeforeCapitals, camelCaseToKebabCase, singleCamel, singlePascal} from "../../utils/inflector"

export interface IBuilder<T> {
  getTemplateValues(Options: T): Promise<any>
}

export interface BaseGeneratorOptions extends GeneratorOptions {
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

export abstract class Builder<T> implements IBuilder<T> {
  abstract getTemplateValues(Options: T): Promise<any>

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

  private possibleZodTypes = ["string", "null", "undefined", "unknown", "void", "boolean"]
  private possibleComponentTypes = ["string", "any", "int", "number", "boolean"]

  public getZodTypeName(type: string = "") {
    if (this.possibleZodTypes.includes(type)) {
      return type
    } else {
      return type === "int" ? "number" : "any"
    }
  }

  public async getComponentForType(type: string = ""):Promise<string> {
    if (!process.env.BLITZ_APP_DIR) {
      process.env.BLITZ_APP_DIR = "."
    }

    // TODO: Need to research if this is an expensive call. If we have a ton of fields, 
    // we should probably throw this behind a proxy that's reused
    // over the lifetime of a generator command:
    const {loadConfigAtRuntime} = await import("next/dist/server/config-shared")
    const config = await loadConfigAtRuntime()
    const typeToComponentMap = config.template.typeToComponentMap

    if (this.possibleComponentTypes.includes(type)) {
      return typeToComponentMap[type]
    } else {
      return typeToComponentMap["string"]
    }
  }

  // eslint-disable-next-line require-await
  public async getFieldTemplateValues(args: string[]){
    const argsPromises = args.map(async (arg: string) => {
      const [valueName, typeName] = arg.split(":")
      
      return {
        attributeName: singleCamel(valueName),
        zodTypeName: this.getZodTypeName(typeName),
        FieldComponent: await this.getComponentForType(typeName), // get component based on type. TODO: Override argument 3?
        fieldName: singleCamel(valueName), // fieldName
        FieldName: singlePascal(valueName), // FieldName
        field_name: addSpaceBeforeCapitals(valueName).toLocaleLowerCase(), // field name
        Field_name: singlePascal(addSpaceBeforeCapitals(valueName).toLocaleLowerCase()), // Field name
        Field_Name: singlePascal(addSpaceBeforeCapitals(valueName)), // Field Name
      }
    })
    return Promise.all(argsPromises)
  }
}
