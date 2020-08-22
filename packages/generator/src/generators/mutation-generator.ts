import {Generator, GeneratorOptions} from "../generator"
import {join} from "path"

export interface MutationGeneratorOptions extends GeneratorOptions {
  modelName: string
}

export class MutationGenerator extends Generator<MutationGeneratorOptions> {
  sourceRoot = join(__dirname, "./templates/mutation")

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return {
      modelName: this.options.modelName,
    }
  }

  getTargetDirectory() {
    const context = this.options.context ? `${this.options.context}` : ""
    return `app/${context}/mutations`
  }
}
