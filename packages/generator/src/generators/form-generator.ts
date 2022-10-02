import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"
import {FieldValuesBuilder, ResourceGeneratorOptions} from ".."
import {Generator, SourceRootType} from "../generator"

export interface FormGeneratorOptions extends ResourceGeneratorOptions {}

export class FormGenerator extends Generator<FormGeneratorOptions> {
  sourceRoot: SourceRootType
  constructor(options: FormGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "form"})
  }

  static subdirectory = "queries"

  templateValuesBuilder = new FieldValuesBuilder()

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}/` : ""
    const kebabCaseModelName = camelCaseToKebabCase(this.options.modelNames)
    return `app/${context}${kebabCaseModelName}/components`
  }
}
