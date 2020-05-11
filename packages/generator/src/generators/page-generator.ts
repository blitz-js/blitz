import {Generator, GeneratorOptions} from '../generator'
import {join} from 'path'

export interface PageGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  parentModel?: string
  parentModels?: string
}

export class PageGenerator extends Generator<PageGeneratorOptions> {
  static subdirectory = 'pages'
  sourceRoot = join(__dirname, './templates/page')

  private getParentIdParam() {
    return `[${this.options.parentModel}Id]`
  }
  async getTemplateValues() {
    return {
      id: '[id]',
      parentModelParam: this.getParentIdParam(),
      modelName: this.options.modelName,
      modelNames: this.options.modelNames,
      ModelName: this.options.ModelName,
      ModelNames: this.options.ModelNames,
    }
  }

  getTargetDirectory() {
    const context = this.options.context ? `${this.options.context}/` : ''
    const parent = this.options.parentModels ? `${this.options.parentModels}/__parentModelParam__/` : ''
    return `app/${context}${this.options.modelNames}/pages/${parent}${this.options.modelNames}`
  }
}
