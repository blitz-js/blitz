// import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"
import {FieldValuesBuilder, ResourceGeneratorOptions} from ".."
import {Generator, SourceRootType} from "../generator"

export interface MutationsGeneratorOptions extends ResourceGeneratorOptions {}

export class MutationsGenerator extends Generator<MutationsGeneratorOptions> {
  sourceRoot: SourceRootType
  constructor(options: MutationsGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "mutations"})
  }
  static subdirectory = "mutations"

  templateValuesBuilder = new FieldValuesBuilder(this.fs)

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}/` : ""
    const kebabCaseModelName = camelCaseToKebabCase(this.options.modelNames)
    return `app/${context}${kebabCaseModelName}/mutations`
  }
}
