import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface MutationGeneratorOptions extends GeneratorOptions {
  name: string
  Name: string
}

export class MutationGenerator extends Generator<MutationGeneratorOptions> {
  sourceRoot: SourceRootType
  constructor(options: MutationGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "mutation"})
  }
  static subdirectory = "mutation"

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return {
      name: this.options.name,
      Name: this.options.Name,
    }
  }

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}` : ""
    return `src/${context}/mutations`
  }
}
