import {join} from "path"
import {Generator, GeneratorOptions} from "../generator"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface QueryGeneratorOptions extends GeneratorOptions {
  rawInput: string
}

export class QueryGenerator extends Generator<QueryGeneratorOptions> {
  static subdirectory = "query"
  sourceRoot = join(__dirname, "./templates/query")

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return {
      rawInput: this.options.rawInput,
    }
  }

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}` : ""
    return `app/${context}/queries`
  }
}
