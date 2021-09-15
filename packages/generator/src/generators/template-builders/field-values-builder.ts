import {singleCamel, singlePascal} from "../.."
import {addSpaceBeforeCapitals} from "../../utils/inflector"
import {BaseGeneratorOptions, Builder} from "./builder"

export class FieldValuesBuilder extends Builder<BaseGeneratorOptions> {
  // eslint-disable-next-line require-await
  public async getTemplateValues(options: BaseGeneratorOptions) {
    await this.getComponentForType()
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
      fieldTemplateValues: options.extraArgs?.map((arg: string) => {
        const [valueName, typeName] = arg.split(":")
        // Get component from blitz config using type map
        return {
          attributeName: singleCamel(valueName),
          zodTypeName: this.getZodTypeName(typeName),
          FieldComponent: "Component TODO", // get component based on type. TODO: Override argument 3?
          fieldName: singleCamel(valueName), // fieldName
          FieldName: singlePascal(valueName), // FieldName
          field_name: addSpaceBeforeCapitals(valueName).toLocaleLowerCase(), // field name
          Field_name: singlePascal(addSpaceBeforeCapitals(valueName).toLocaleLowerCase()), // Field name
          Field_Name: singlePascal(addSpaceBeforeCapitals(valueName)), // Field Name
        }
      }),
    }
    return values
  }
}
