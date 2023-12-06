import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"
import fs from "fs-extra"

export interface QueryGeneratorOptions extends GeneratorOptions {
  name: string
  Name: string
}

export class QueryGenerator extends Generator<QueryGeneratorOptions> {
  sourceRoot: SourceRootType
  isAppDir = false
  constructor(options: QueryGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "query"})
    this.isAppDir = fs.existsSync(require("path").join(process.cwd(), "src/app/layout.tsx"))
  }
  static subdirectory = "query"

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
      return `src/app/${context}/queries`
    }
    return `src/${context}/queries`
  }
}
