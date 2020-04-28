import Generator, {GeneratorOptions} from '../generator'

export interface PageGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  fileContext: string
}

class PageGenerator extends Generator<PageGeneratorOptions> {
  static subdirectory = 'pages'
  static template = 'page'

  async getTemplateValues() {
    return {
      id: '[id]',
      modelName: this.options.modelName,
      modelNames: this.options.modelNames,
      ModelName: this.options.ModelName,
      ModelNames: this.options.ModelNames,
    }
  }
}

export default PageGenerator
