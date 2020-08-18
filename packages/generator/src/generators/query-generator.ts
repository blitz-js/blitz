import {Generator, GeneratorOptions} from "../generator"
import {join} from "path"

export interface QueryGeneratorOptions extends GeneratorOptions {
  modelName: string
}

export class QueryGenerator extends Generator<QueryGeneratorOptions> {
  static subdirectory = "query"
  sourceRoot = join(__dirname, "./templates/query")

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return {
      modelName: this.options.modelName,
    }
  }

  getTargetDirectory() {
    const context = this.options.context ? `${this.options.context}` : ""
    return `app/${context}/queries`
  }
}
