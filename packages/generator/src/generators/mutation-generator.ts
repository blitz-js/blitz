import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface MutationGeneratorOptions extends GeneratorOptions {
  name: string
  Name: string
}

export class MutationGenerator extends Generator<MutationGeneratorOptions> {
  static subdirectory = "mutation"
  sourceRoot: SourceRootType = {type: "template", path: "mutation"}

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return {
      name: this.options.name,
      Name: this.options.Name,
    }
  }

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}` : ""
    return `app/${context}/mutations`
  }
}
