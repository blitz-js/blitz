import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface QueryGeneratorOptions extends GeneratorOptions {
  name: string
  Name: string
}

export class QueryGenerator extends Generator<QueryGeneratorOptions> {
  static subdirectory = "query"
  sourceRoot: SourceRootType = {type: "template", path: "query"}

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return {
      name: this.options.name,
      Name: this.options.Name,
    }
  }

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}` : ""
    return `app/${context}/queries`
  }
}
