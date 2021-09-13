import { FieldValuesBuilder } from ".."
import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface MutationsGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  parentModel?: string
  parentModels?: string
  ParentModel?: string
  ParentModels?: string
  extraArgs?: string[]
}

export class MutationsGenerator extends Generator<MutationsGeneratorOptions> {
  static subdirectory = "mutations"
  sourceRoot: SourceRootType = {type: "template", path: "mutations"}

  templateValuesBuilder = new FieldValuesBuilder()

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}/` : ""
    const kebabCaseModelName = camelCaseToKebabCase(this.options.modelNames)
    return `app/${context}${kebabCaseModelName}/mutations`
  }
}
