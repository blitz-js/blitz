import {GeneratorOptions} from "../../generator"
import {camelCaseToKebabCase} from "../../utils/inflector"

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

  public getZodTypeName(type: string = "") {
    if (["string", "null", "undefined", "unknown", "void", "boolean"].includes(type)) {
      return type
    } else {
      return type === "int" ? "number" : "any"
    }
  }
}
