import Generator, {GeneratorOptions} from '../generator'

export interface QueryMutationGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  fileContext: string
}

class QueryGenerator extends Generator<QueryMutationGeneratorOptions> {
  static subdirectory = 'queries'
  static template = 'query'

  async getTemplateValues() {
    return {
      modelName: this.options.modelName,
      modelNames: this.options.modelNames,
      ModelName: this.options.ModelName,
      ModelNames: this.options.ModelNames,
    }
  }
}

export default QueryGenerator
