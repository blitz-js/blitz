import {CommonTemplateValues, FieldValuesBuilder, ResourceGeneratorOptions} from ".."
import {Generator, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"
import {spawn} from "cross-spawn"
import which from "npm-which"
import * as fs from "fs-extra"

export interface PageGeneratorOptions extends ResourceGeneratorOptions {}

export class PageGenerator extends Generator<PageGeneratorOptions> {
  sourceRoot: SourceRootType
  constructor(options: PageGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "page"})
  }
  static subdirectory = "../../.."

  templateValuesBuilder = new FieldValuesBuilder(this.fs)

  getModelNamesPath() {
    const kebabCaseContext = this.options.context
      ? `${camelCaseToKebabCase(this.options.context)}/`
      : ""
    const kebabCaseModelNames = camelCaseToKebabCase(this.options.modelNames)
    return kebabCaseContext + kebabCaseModelNames
  }

  getTargetDirectory() {
    const kebabCaseModelName = camelCaseToKebabCase(this.options.modelNames)
    const parent = this.options.parentModels
      ? `${this.options.parentModels}/__parentModelParam__/`
      : ""
    return `src/pages/${parent}${kebabCaseModelName}`
  }

  async preFileWrite(): Promise<CommonTemplateValues> {
    const templateValues = await this.getTemplateValues()
    const targetDirectory = this.getTargetDirectory().replace(
      "__parentModelParam__",
      templateValues.parentModelParam,
    )
    if (templateValues.parentModel) {
      const modelPages = fs.existsSync(
        `src/pages/${camelCaseToKebabCase(templateValues.modelNames)}`,
      )
      if (modelPages) {
        if (!fs.existsSync(targetDirectory)) {
          fs.moveSync(
            `src/pages/${camelCaseToKebabCase(templateValues.modelNames)}`,
            targetDirectory,
          )
        }
      }
    }
    return templateValues
  }

  async postWrite() {
    await new Promise<void>((res, rej) => {
      const blitzBin = which(process.cwd()).sync("blitz")
      const child = spawn(blitzBin, ["codegen"], {stdio: "inherit"})
      child.on("exit", (code) => (code === 0 ? res() : rej()))
    })
  }
}
