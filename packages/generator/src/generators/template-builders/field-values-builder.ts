import {getPrismaSchema} from "../../utils/get-prisma-schema"
import {FieldGeneratorOptions, Builder, CommonTemplateValues} from "./builder"
import {create as createStore} from "mem-fs"
import {create as createEditor, Editor} from "mem-fs-editor"
import * as ast from "@mrleebo/prisma-ast"

export class FieldValuesBuilder extends Builder<FieldGeneratorOptions, CommonTemplateValues> {
  private getEditor = (): Editor => {
    if (this.fs !== undefined) {
      return this.fs
    }
    const store = createStore()
    this.fs = createEditor(store)
    return this.fs
  }

  // eslint-disable-next-line require-await
  public async getTemplateValues(options: FieldGeneratorOptions): Promise<CommonTemplateValues> {
    const values:CommonTemplateValues = {
      parentModelId: this.getId(options.parentModel),
      parentModelIdZodType: undefined,
      parentModelParam: this.getParam(this.getId(options.parentModel)),
      parentModel: options.parentModel,
      parentModels: options.parentModels,
      ParentModel: options.ParentModel,
      ParentModels: options.ParentModels,
      modelId: this.getId(options.modelName),
      modelIdZodType: "number",
      modelIdParam: this.getParam(this.getId(options.modelName)),
      modelName: options.modelName,
      modelNames: options.modelNames,
      ModelName: options.ModelName,
      ModelNames: options.ModelNames,
      modelNamesPath: this.getModelNamesPath(options.context, options.modelNames),
    }
    if (options.extraArgs) {
      let argValue = ""

      const checks = options.extraArgs.map(async (arg) => {
        const [valueName, typeName] = arg.split(":")
        if (valueName === "id") {
          values.modelIdZodType = await this.getZodTypeName(typeName)
          argValue = arg
        }
      })
      await Promise.all(checks)

      // remove id argument before processing
      const nonIdArgs = options.extraArgs.filter((arg) => arg !== argValue)

      if (options.parentModel !== undefined && options.parentModel.length > 0) {
        const {schema} = getPrismaSchema(this.getEditor())
        // O(N) - N is total ast Blocks
        const model = schema.list.find(function (component): component is ast.Model {
          return component.type === "model" && component.name === "Project"
          //TODO: Check case sensitivity, is  component.name === options.parentModel || component.name === options.ParentModel necessary
          // Case sensitvity is important. Schema.prisma allows both project and Project to exist in the same file
          // We need to inform users to pass in the exact name (in the docs), and we also need to access the raw argument passed in by the
          // user here.
        })

        if (model !== undefined) {
          // O(N) - N is number of properties in parent model
          const idField = model.properties.find(function (property): property is ast.Field {
            return (
              property.type === "field" &&
              property.attributes?.findIndex((attr) => attr.name === "id") !== -1
            )
          })

          // TODO: Do we want a map between prisma types and "user types", we can then use that map instead of these conditionals
          if (idField?.fieldType === "Int") {
            values.parentModelIdZodType = "number"
          } else if (idField?.fieldType === "String") {            
            if (
              idField.attributes?.find(
                (attr) => attr.name === "default" && attr.args?.findIndex((arg) => arg.value === "uuid") !== -1,
              )
            ) {
              values.parentModelIdZodType = "string().uuid"
            } else {
              values.parentModelIdZodType = "string"
            }
          }
        } else {
          // handle scenario where parent wasnt found in existing schema. Should we throw an error, or a warning asking the user to verify that the parent model exists?
        }
      }

      const ftv = await this.getFieldTemplateValues(nonIdArgs)
      return {...values, fieldTemplateValues: ftv}
    }

    return values
  }
}
