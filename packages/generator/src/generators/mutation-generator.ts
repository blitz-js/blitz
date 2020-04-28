import Generator, {GeneratorOptions} from '../generator'
import {join} from 'path'

export interface MutationGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  fileContext: string
}

export class MutationGenerator extends Generator<MutationGeneratorOptions> {
  static subdirectory = 'mutations'
  sourceRoot = join(__dirname, '../../templates/mutation')

  async getTemplateValues() {
    return {
      modelName: this.options.modelName,
      modelNames: this.options.modelNames,
      ModelName: this.options.ModelName,
      ModelNames: this.options.ModelNames,
    }
  }
}
