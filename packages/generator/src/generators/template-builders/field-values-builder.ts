import * as ast from "@mrleebo/prisma-ast"
import {create as createStore} from "mem-fs"
import {create as createEditor, Editor} from "mem-fs-editor"
import {getResourceValueFromCodegen} from "../../utils/get-codegen"
import {getPrismaSchema} from "../../utils/get-prisma-schema"
import {ModelName, modelName, ModelNames, modelNames} from "../../utils/model-names"
import {Builder, CommonTemplateValues, ResourceGeneratorOptions} from "./builder"

export class FieldValuesBuilder extends Builder<ResourceGeneratorOptions, CommonTemplateValues> {
  private getEditor = (): Editor => {
    if (this.fs !== undefined) {
      return this.fs
    }
    const store = createStore()
    this.fs = createEditor(store)
    return this.fs
  }

  // eslint-disable-next-line require-await
  public async getTemplateValues(options: ResourceGeneratorOptions): Promise<CommonTemplateValues> {
    const prismaFolder = getPrismaSchema(this.getEditor())
    let values: CommonTemplateValues = {
      prismaFolder: typeof prismaFolder !== "boolean" ? prismaFolder.dbFolder : "db",
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
      // specialArgs - these are arguments like 'id' or 'belongsTo', which are not meant to
      // be processed as fields but have their own special logic
      const specialArgs: {[key in string]: string} = {}

      const processSpecialArgs: Promise<void>[] = options.extraArgs.map(async (arg) => {
        const [valueName, typeName] = arg.split(":")
        if (valueName === "id") {
          values.modelIdZodType = await this.getZodType(typeName)
          specialArgs[arg] = "present"
        }
        if (valueName === "belongsTo") {
          specialArgs[arg] = "present"
          process.env.parentModel = typeName
          options.rawParentModelName = typeName
          options.parentModel = modelName(typeName)
          options.parentModels = modelNames(typeName)
          options.ParentModel = ModelName(typeName)
          options.ParentModels = ModelNames(typeName)
          values.parentModelId = this.getId(modelName(typeName))
        }
      })
      await Promise.all(processSpecialArgs)
      // Filter out special args by making sure the argument isn't present in the list
      const nonSpecialArgs = options.extraArgs.filter((arg) => specialArgs[arg] !== "present")

      // Get the parent model it type if options.parentModel exists
      if (options.parentModel !== undefined && options.parentModel.length > 0) {
        const obj = getPrismaSchema(this.getEditor())
        if (typeof obj !== "boolean") {
          const schema = obj.schema
          // O(N) - N is total ast Blocks
          const model = schema.list.find(function (component): component is ast.Model {
            return component.type === "model" && component.name === options.rawParentModelName
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
            // We have a map from "user types" (which are what users type into the blitz generate command)
            // to primsa type and other types, but we dont have a reverse map 1:1. This is because we lose
            // some information for certain maps. E.g.: fieldname:uuid will be converted into a Prisma field with
            // the String type, and the uuid portion is added to a decorator at the end of the field.
            // This means it is more complicated to extract the original "user specified type" than creating a reverse map
            if (idField?.fieldType === "Int") {
              // TODO: Check if ints have decorators that make them a different type, like Bigint, etc.
              // And see if that has to map to a different user specified type
              values.parentModelIdZodType = await getResourceValueFromCodegen("int", "zodType")
            } else if (idField?.fieldType === "String") {
              if (
                idField.attributes?.find(
                  (attr) =>
                    attr.name === "default" &&
                    attr.args?.findIndex((arg) => arg.value === "uuid") !== -1,
                )
              ) {
                values.parentModelIdZodType = await getResourceValueFromCodegen("uuid", "zodType")
              } else {
                values.parentModelIdZodType = await getResourceValueFromCodegen("string", "zodType")
              }
            }
          }
        } else {
          // TODO: handle scenario where parent wasnt found in existing schema. Should we throw an error, or a warning asking the user to verify that the parent model exists?
        }
      }
      if (nonSpecialArgs.length > 0) {
        const ftv = await this.getFieldTemplateValues(nonSpecialArgs)
        return {...values, fieldTemplateValues: ftv}
      }
    }
    return values
  }
}
