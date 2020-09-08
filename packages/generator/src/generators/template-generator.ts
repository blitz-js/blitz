import {Generator, GeneratorOptions} from "../generator"
import {log} from "@blitzjs/display"
import * as path from "path"

export interface TemplateGeneratorOptions extends GeneratorOptions {
  modelName: string
}

export class TemplateGenerator extends Generator<TemplateGeneratorOptions> {
  sourceRoot = ""
  prettierDisabled = true
  getTargetDirectory() {
    return "templates"
  }

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return this.options
  }

  async write() {}

  // eslint-disable-next-line require-await
  async preCommit() {
    if (this.options.extraArgs) {
      if (this.options.extraArgs.length > 1) {
        log.error(
          "Too many arguments provided. Please specify the template type using `type=[template type]`",
        )
        return
      }
    }

    const [, providedType] = (this.options.extraArgs ?? [])[0]?.split(":") ?? ""
    const destination = this.destinationPath("templates", providedType, this.options.modelName)

    this.fs.copy(
      path.resolve(__dirname, path.join("../templates", providedType || "generic")),
      destination,
    )
  }
}
