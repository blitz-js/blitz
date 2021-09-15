import {GeneratorOptions} from "../../generator"
import {camelCaseToKebabCase} from "../../utils/inflector"
const debug = require("debug")("blitz:generator")

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

  private possibleTypes = ["string", "null", "undefined", "unknown", "void", "boolean"]

  public getZodTypeName(type: string = "") {
    if (this.possibleTypes.includes(type)) {
      return type
    } else {
      return type === "int" ? "number" : "any"
    }
  }
  
  public async getComponentForType(type: string = ""){
    process.env.BLITZ_APP_DIR = "."
    debug("app dir is")
    debug(process.env.BLITZ_APP_DIR)
    const {loadConfigAtRuntime} = await import("next/dist/server/config-shared")
    const config = await loadConfigAtRuntime();
    debug("displaying config")
    debug(config)

    // const typeToComponentMap = 
    if (this.possibleTypes.includes(type)) {
      return type
    } else {
      return type === "int" ? "number" : "any"
    }
  }
}
