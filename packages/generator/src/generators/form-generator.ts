import { FieldValuesBuilder } from ".."
import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface FormGeneratorOptions extends GeneratorOptions {
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

export class FormGenerator extends Generator<FormGeneratorOptions> {
  static subdirectory = "queries"
  sourceRoot: SourceRootType = {type: "template", path: "form"}

  templateValuesBuilder = new FieldValuesBuilder()

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}/` : ""
    const kebabCaseModelName = camelCaseToKebabCase(this.options.modelNames)
    return `app/${context}${kebabCaseModelName}/components`
  }
}
