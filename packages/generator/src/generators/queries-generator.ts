import { FieldValuesBuilder } from ".."
import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {camelCaseToKebabCase} from "../utils/inflector"

export interface QueriesGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  parentModel?: string
  parentModels?: string
  ParentModel?: string
  ParentModels?: string
}

export class QueriesGenerator extends Generator<QueriesGeneratorOptions> {
  static subdirectory = "queries"
  sourceRoot: SourceRootType = {type: "template", path: "queries"}

  templateValuesBuilder = new FieldValuesBuilder(this.fs)
  
  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}/` : ""
    const kebabCaseModelName = camelCaseToKebabCase(this.options.modelNames)
    return `app/${context}${kebabCaseModelName}/queries`
  }
}
