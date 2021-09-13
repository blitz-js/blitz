import {GeneratorOptions} from "@babel/generator"

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
}
