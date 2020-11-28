import {join} from "path"
import {Generator, GeneratorOptions} from "../generator"
import {camelCaseToKebabCase} from "../utils/kebab-case"

export interface MutationGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  parentModel?: string
  parentModels?: string
  ParentModel?: string
  ParentModels?: string
}

export class MutationGenerator extends Generator<MutationGeneratorOptions> {
  static subdirectory = "mutations"
  sourceRoot = join(__dirname, "./templates/mutation")

  private getId(input: string = "") {
    if (!input) return input
    return `${input}Id`
  }

  private getParam(input: string = "") {
    if (!input) return input
    return `[${input}]`
  }

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return {
      parentModelId: this.getId(this.options.parentModel),
      parentModelParam: this.getParam(this.getId(this.options.parentModel)),
      parentModel: this.options.parentModel,
      parentModels: this.options.parentModels,
      ParentModel: this.options.ParentModel,
      ParentModels: this.options.ParentModels,
      modelId: this.getId(this.options.modelName),
      modelIdParam: this.getParam(this.getId(this.options.modelName)),
      modelName: this.options.modelName,
      modelNames: this.options.modelNames,
      ModelName: this.options.ModelName,
      ModelNames: this.options.ModelNames,
    }
  }

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}/` : ""
    return `app/${context}${this.options.modelNames}/mutations`
  }
}
