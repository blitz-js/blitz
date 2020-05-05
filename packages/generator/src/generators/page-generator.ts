import {Generator, GeneratorOptions} from '../generator'
import {join} from 'path'

export interface PageGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
}

export class PageGenerator extends Generator<PageGeneratorOptions> {
  static subdirectory = 'pages'
  sourceRoot = join(__dirname, './templates/page')

  async getTemplateValues() {
    return {
      id: '[id]',
      modelName: this.options.modelName,
      modelNames: this.options.modelNames,
      ModelName: this.options.ModelName,
      ModelNames: this.options.ModelNames,
    }
  }

  getTargetDirectory() {
    return `app/${this.options.modelNames}/pages/${this.options.modelNames}`
  }
}
