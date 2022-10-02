import {FieldValuesBuilder, ResourceGeneratorOptions} from ".."
import {Generator, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"
import {spawn} from "cross-spawn"
import which from "npm-which"

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
    return `pages/${parent}${kebabCaseModelName}`
  }

  async postWrite() {
    await new Promise<void>((res, rej) => {
      const blitzBin = which(process.cwd()).sync("blitz")
      const child = spawn(blitzBin, ["codegen"], {stdio: "inherit"})
      child.on("exit", (code) => (code === 0 ? res() : rej()))
    })
  }
}
