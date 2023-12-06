import {FieldValuesBuilder, ResourceGeneratorOptions} from ".."
import {Generator, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface RouteGeneratorOptions extends ResourceGeneratorOptions {}

export class RouteGenerator extends Generator<RouteGeneratorOptions> {
  sourceRoot: SourceRootType
  constructor(options: RouteGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "route"})
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
    return `src/app/${parent}${kebabCaseModelName}`
  }
}
