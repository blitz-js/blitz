import Generator, {GeneratorOptions} from '../generator'

export interface MutationGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  fileContext: string
}

class MutationGenerator extends Generator<MutationGeneratorOptions> {
  static subdirectory = 'mutations'
  static template = 'mutation'

  async getTemplateValues() {
    return {
      modelName: this.options.modelName,
      modelNames: this.options.modelNames,
      ModelName: this.options.ModelName,
      ModelNames: this.options.ModelNames,
    }
  }
}

export default MutationGenerator
