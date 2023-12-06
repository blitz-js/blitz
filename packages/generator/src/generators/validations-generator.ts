import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"
import j from "jscodeshift"
import {
  CommonTemplateValues,
  createFieldTemplateValues,
  FieldValuesBuilder,
  ResourceGeneratorOptions,
} from ".."
import {customTsParser, Generator, SourceRootType} from "../generator"
import {replaceImportDbWithPrismaFolder} from "../../src/utils/codemod-utils"
import fs from "fs-extra"

export interface ValidationsGeneratorOptions extends ResourceGeneratorOptions {}

export class ValidationsGenerator extends Generator<ValidationsGeneratorOptions> {
  sourceRoot: SourceRootType
  isAppDir = false
  constructor(options: ValidationsGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "validations"})
    this.isAppDir = fs.existsSync(require("path").join(process.cwd(), "src/app/layout.tsx"))
  }
  static subdirectory = "validations"

  templateValuesBuilder = new FieldValuesBuilder(this.fs)

  async preFileWrite(filePath: string): Promise<CommonTemplateValues> {
    let templateValues = await this.getTemplateValues()
    if (templateValues.parentModel) {
      const newFieldTemplateValues = await createFieldTemplateValues(
        templateValues.parentModelId,
        templateValues.parentModelIdZodType,
        true,
      )
      if (templateValues.fieldTemplateValues) {
        templateValues.fieldTemplateValues.push(newFieldTemplateValues)
      } else {
        templateValues.fieldTemplateValues = [newFieldTemplateValues]
      }
    }
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
      return `src/app/${context}${kebabCaseModelName}`
    }
    return `src/${context}${kebabCaseModelName}`
  }
}
