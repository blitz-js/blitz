import {DMMF} from "@prisma/generator-helper"
import {merge, produceSchema} from "./produce-schema"
import {PrismaField} from "./types"

/**
 * Adds a field to a model in your schema.prisma data model.
 *
 * @param source - schema.prisma source file contents
 * @param modelName - name of the model to add a field to
 * @param fieldProps - the field to add
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 * addPrismaField(source, "Project", {name: "description", type: "String", isRequired: true})
 * ```
 */
export function addPrismaField(
  source: string,
  modelName: string,
  fieldProps: PrismaField,
): Promise<string> {
  return produceSchema(source, ({doc}) => {
    const model = doc.datamodel.models.find((x) => x.name === modelName)
    if (!model) return

    const existing = model.fields.find((x) => x.name === fieldProps.name)
    const field: DMMF.Field = Object.assign(
      {
        kind: "scalar",
        isRequired: false,
        isUnique: false,
        isList: false,
        isId: false,
        isGenerated: false,
        hasDefaultValue: false,
      },
      fieldProps,
    )
    existing ? merge(existing, field) : model.fields.push(field)
  })
}
