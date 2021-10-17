import {FieldValuesBuilder, ResourceGeneratorOptions} from ".."
import {Generator, SourceRootType} from "../generator"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface PageGeneratorOptions extends ResourceGeneratorOptions {}

export class PageGenerator extends Generator<PageGeneratorOptions> {
  static subdirectory = "pages"
  sourceRoot: SourceRootType = {type: "template", path: "page"}

  templateValuesBuilder = new FieldValuesBuilder(this.fs)

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
