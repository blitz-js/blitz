import {join} from "path"
import {Generator, GeneratorOptions} from "../generator"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface MutationGeneratorOptions extends GeneratorOptions {
  rawInput: string
}

export class MutationGenerator extends Generator<MutationGeneratorOptions> {
  static subdirectory = "mutation"
  sourceRoot = join(__dirname, "./templates/mutation")

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return {
      rawInput: this.options.rawInput,
    }
  }

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}` : ""
    return `app/${context}/mutations`
  }
}
