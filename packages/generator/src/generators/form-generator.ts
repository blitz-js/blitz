import {getTemplateRoot} from "../utils/get-template-root"
import {camelCaseToKebabCase} from "../utils/inflector"
import {
  CommonTemplateValues,
  createFieldTemplateValues,
  FieldValuesBuilder,
  ResourceGeneratorOptions,
} from ".."
import {customTsParser, Generator, SourceRootType} from "../generator"
import j from "jscodeshift"
import {
  insertImportPagnatedQuery,
  insertImportQuery,
  insertLabeledSelectField,
  updateFormWithParent,
} from "../../src/utils/codemod-utils"
import fs from "fs-extra"

export interface FormGeneratorOptions extends ResourceGeneratorOptions {}

export class FormGenerator extends Generator<FormGeneratorOptions> {
  sourceRoot: SourceRootType
  isAppDir = false
  constructor(options: FormGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "template", path: "form"})
    this.isAppDir = fs.existsSync(require("path").join(process.cwd(), "src/app/layout.tsx"))
  }

  static subdirectory = "queries"

  templateValuesBuilder = new FieldValuesBuilder()

  async preFileWrite(): Promise<CommonTemplateValues> {
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
    templateValues = {
      ...templateValues,
      coreComponentsImportPath: this.isAppDir ? "src/app/components" : "src/core/components",
    }
    return templateValues
  }

  async postFileWrite(filePath: string, templateValues: CommonTemplateValues): Promise<void> {
    if (templateValues.parentModel && filePath.match(/components/g)) {
      let program = j(this.fs.read(filePath), {
        parser: customTsParser,
      })
      program = insertLabeledSelectField(program)
      program = insertImportQuery(program, templateValues)
      program = insertImportPagnatedQuery(program)
      program = updateFormWithParent(program, templateValues)
      this.fs.write(filePath, program.toSource())
    }
  }

  getTargetDirectory() {
    const context = this.options.context ? `${camelCaseToKebabCase(this.options.context)}/` : ""
    const kebabCaseModelName = camelCaseToKebabCase(this.options.modelNames)
    if (this.isAppDir) return `src/app/${context}${kebabCaseModelName}/components`
    return `src/${context}${kebabCaseModelName}/components`
  }
}
