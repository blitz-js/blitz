import {BaseGeneratorOptions, Builder} from "./builder"

export class FieldValuesBuilder extends Builder<BaseGeneratorOptions> {
  // eslint-disable-next-line require-await
  public async getTemplateValues(options: BaseGeneratorOptions) {
    const values = {
      parentModelId: this.getId(options.parentModel),
      parentModelParam: this.getParam(this.getId(options.parentModel)),
      parentModel: options.parentModel,
      parentModels: options.parentModels,
      ParentModel: options.ParentModel,
      ParentModels: options.ParentModels,
      modelId: this.getId(options.modelName),
      modelIdParam: this.getParam(this.getId(options.modelName)),
      modelName: options.modelName,
      modelNames: options.modelNames,
      ModelName: options.ModelName,
      ModelNames: options.ModelNames,
      modelNamesPath: this.getModelNamesPath(options.context, options.modelNames),
    }
    if (options.extraArgs) {
      const ftv = await this.getFieldTemplateValues(options.extraArgs)
      return {...values, fieldTemplateValues: ftv}
    }

    return values
  }
}
