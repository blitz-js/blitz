import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"
import fs from "fs-extra"

export interface MutationGeneratorOptions extends GeneratorOptions {
  name: string
  Name: string
}

export class MutationGenerator extends Generator<MutationGeneratorOptions> {
  sourceRoot: SourceRootType
  isAppDir = false
  constructor(options: MutationGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "mutation"})
    this.isAppDir = fs.existsSync(require("path").join(process.cwd(), "src/app/layout.tsx"))
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
    if (this.isAppDir) {
      return `src/app/${context}/mutations`
    }
    return `src/${context}/mutations`
  }
}
