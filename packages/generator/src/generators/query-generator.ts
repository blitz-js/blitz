import {Generator, GeneratorOptions} from '../generator'
import {join} from 'path'

export interface QueryGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
}

export class QueryGenerator extends Generator<QueryGeneratorOptions> {
  static subdirectory = 'queries'
  sourceRoot = join(__dirname, './templates/query')

  async getTemplateValues() {
    return {
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
