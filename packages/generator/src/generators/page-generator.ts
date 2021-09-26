import {FieldValuesBuilder} from ".."
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

  templateValuesBuilder = new FieldValuesBuilder()

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
