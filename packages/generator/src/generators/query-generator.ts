import {Generator, GeneratorOptions} from '../generator'
import {join} from 'path'

export interface QueryGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  parentModel?: string
  parentModels?: string
  ParentModel?: string
  ParentModels?: string
}

export class QueryGenerator extends Generator<QueryGeneratorOptions> {
  static subdirectory = 'queries'
  sourceRoot = join(__dirname, './templates/query')

  private getId(input: string = '') {
    if (!input) return input
    return `${input}Id`
  }

  private getParam(input: string = '') {
    if (!input) return input
    return `[${input}]`
  }

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
    const context = this.options.context ? `${this.options.context}/` : ''
    return `app/${context}${this.options.modelNames}/queries`
  }
}
