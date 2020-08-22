import {Generator, GeneratorOptions} from "../generator"
import {join} from "path"

export interface PageGeneratorOptions extends GeneratorOptions {
  ModelName: string
}

export class PageGenerator extends Generator<PageGeneratorOptions> {
  sourceRoot = join(__dirname, "./templates/page")

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return {
      ModelName: this.options.ModelName,
    }
  }

  getTargetDirectory() {
    return `app/${this.options.context || ""}/pages`
  }
}
