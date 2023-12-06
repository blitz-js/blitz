import {CommonTemplateValues, FieldValuesBuilder, ResourceGeneratorOptions} from ".."
import {customTsParser, Generator, SourceRootType} from "../generator"
import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"
import j from "jscodeshift"
import {replaceImportDbWithPrismaFolder} from "../../src/utils/codemod-utils"
import fs from "fs-extra"

export interface QueriesGeneratorOptions extends ResourceGeneratorOptions {}

export class QueriesGenerator extends Generator<QueriesGeneratorOptions> {
  sourceRoot: SourceRootType
  isAppDir = false
  constructor(options: QueriesGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "queries"})
    this.isAppDir = fs.existsSync(require("path").join(process.cwd(), "src/app/layout.tsx"))
  }
  static subdirectory = "queries"

  templateValuesBuilder = new FieldValuesBuilder(this.fs)

  async preFileWrite(filePath: string): Promise<CommonTemplateValues> {
    let templateValues = await this.getTemplateValues()
    if (this.fs.exists(filePath)) {
      let program = j(this.fs.read(filePath) as any, {
        parser: customTsParser,
      })
      program = replaceImportDbWithPrismaFolder(program)
      this.fs.write(filePath, program.toSource())
    }

    return templateValues
  }

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}/` : ""
    const kebabCaseModelName = camelCaseToKebabCase(this.options.modelNames)
    if (this.isAppDir) {
      return `src/app/${context}${kebabCaseModelName}/queries`
    }
    return `src/${context}${kebabCaseModelName}/queries`
  }
}
