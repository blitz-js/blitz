import { NextConfigComplete } from "next/dist/server/config-shared"
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

  public fallbackMap = {
    string: "LabeledTextField",
    number: "LabeledTextField",
    boolean: "LabeledTextField",
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

  private possibleZodTypes = ["string", "null", "undefined", "unknown", "void", "boolean"]
  private possibleComponentTypes = ["string", "any", "int", "number", "boolean", "uuid"]

  public getZodTypeName(type: string = "") {
    if (this.possibleZodTypes.includes(type)) {
      return type
    } else {
      return type === "int" ? "number" : "any"
    }
  }

  public async getComponentForType(type: string = ""):Promise<string> {
    if (!process.env.BLITZ_APP_DIR) {
      process.env.BLITZ_APP_DIR = process.cwd()
    }

    let config = await this.getConfig()
    if(!config.template?.typeToComponentMap){
      config = this.fallbackMap
    }
    const typeToComponentMap = config.template.typeToComponentMap

    let defaultComponent = typeToComponentMap["string"]
    
    return typeToComponentMap[type] ?? defaultComponent
  }

  private config: NextConfigComplete | undefined = undefined
  
  private async getConfig() {
    if(!this.config){
      const {loadConfigAtRuntime} = await import("next/dist/server/config-shared")
      this.config = await loadConfigAtRuntime()
    }

    return this.config
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
