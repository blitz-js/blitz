import {FieldValuesBuilder, ResourceGeneratorOptions} from ".."
import {Generator, SourceRootType} from "../generator"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface MutationsGeneratorOptions extends ResourceGeneratorOptions {}

export class MutationsGenerator extends Generator<MutationsGeneratorOptions> {
  static subdirectory = "mutations"
  sourceRoot: SourceRootType = {type: "template", path: "mutations"}

  templateValuesBuilder = new FieldValuesBuilder(this.fs)

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}/` : ""
    const kebabCaseModelName = camelCaseToKebabCase(this.options.modelNames)
    return `app/${context}${kebabCaseModelName}/mutations`
  }
}
