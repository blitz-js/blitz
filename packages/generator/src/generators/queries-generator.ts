import {FieldValuesBuilder, ResourceGeneratorOptions} from ".."
import {Generator, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface QueriesGeneratorOptions extends ResourceGeneratorOptions {}

export class QueriesGenerator extends Generator<QueriesGeneratorOptions> {
  sourceRoot: SourceRootType
  constructor(options: QueriesGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "queries"})
  }
  static subdirectory = "queries"

  templateValuesBuilder = new FieldValuesBuilder(this.fs)

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}/` : ""
    const kebabCaseModelName = camelCaseToKebabCase(this.options.modelNames)
    return `app/${context}${kebabCaseModelName}/queries`
  }
}
