import {FieldValuesBuilder, ResourceGeneratorOptions} from ".."
import {Generator, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface PageGeneratorOptions extends ResourceGeneratorOptions {}

export class PageGenerator extends Generator<PageGeneratorOptions> {
  sourceRoot: SourceRootType
  constructor(options: PageGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "page"})
  }
  static subdirectory = "pages"

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
