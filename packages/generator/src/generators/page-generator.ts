import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"
import {spawn} from "cross-spawn"
import which from "npm-which"

export interface PageGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  parentModel?: string
  parentModels?: string
  ParentModel?: string
  ParentModels?: string
}

export class PageGenerator extends Generator<PageGeneratorOptions> {
  sourceRoot: SourceRootType
  constructor(options: PageGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "page"})
  }
  static subdirectory = "../../.."

  private getId(input: string = "") {
    if (!input) return input
    return `${input}Id`
  }

  private getParam(input: string = "") {
    if (!input) return input
    return `[${input}]`
  }

  // eslint-disable-next-line require-await
  async getTemplateValues() {
    return {
      parentModelId: this.getId(this.options.parentModel),
      parentModelParam: this.getParam(this.getId(this.options.parentModel)),
      parentModel: this.options.parentModel,
      parentModels: this.options.parentModels,
      ParentModel: this.options.ParentModel,
      ParentModels: this.options.ParentModels,
      modelId: this.getId(this.options.modelName),
      modelIdParam: this.getParam(this.getId(this.options.modelName)),
      modelName: this.options.modelName,
      modelNames: this.options.modelNames,
      ModelName: this.options.ModelName,
      ModelNames: this.options.ModelNames,
      modelNamesPath: this.getModelNamesPath(),
    }
  }

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
