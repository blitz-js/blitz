import {FieldGeneratorOptions, Builder, CommonTemplateValues} from "./builder"

export class FieldValuesBuilder extends Builder<FieldGeneratorOptions, CommonTemplateValues> {
  // eslint-disable-next-line require-await
  public async getTemplateValues(options: FieldGeneratorOptions):Promise<CommonTemplateValues> {
    const values = {
      parentModelId: this.getId(options.parentModel),
      parentModelIdZodType: "number", // TODO: Need to parse prisma schema and get parent ID somehow
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
        if(valueName === "id"){          
          values.modelIdZodType = await this.getZodTypeName(typeName)
          argValue = arg
        }
      })
      await Promise.all(checks)

      // remove id argument before processing
      const nonIdArgs = options.extraArgs.filter((arg) => arg !== argValue)
      const ftv = await this.getFieldTemplateValues(nonIdArgs)
      return {...values, fieldTemplateValues: ftv}
    }

    return values
  }
}
