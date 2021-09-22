import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {camelCaseToKebabCase} from "../utils/inflector"

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
  static subdirectory = "pages"
  sourceRoot: SourceRootType = {type: "template", path: "page"}

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
    return `app/pages/${parent}${kebabCaseModelName}`
  }

  async postWrite() {
    const {loadConfigProduction} = await import("next/dist/server/config-shared")
    const {saveRouteManifest} = await import("next/dist/build/routes")
    const config = loadConfigProduction(process.cwd())
    await saveRouteManifest(process.cwd(), config)
  }
}
