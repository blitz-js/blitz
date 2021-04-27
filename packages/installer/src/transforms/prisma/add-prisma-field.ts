import {Field, Model} from "@mrleebo/prisma-ast"
import {produceSchema} from "./produce-schema"

/**
 * Adds a field to a model in your schema.prisma data model.
 *
 * @param source - schema.prisma source file contents
 * @param modelName - name of the model to add a field to
 * @param fieldProps - the field to add
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 *  addPrismaField(source, "Project", {
      type: "field",
      name: "name",
      fieldType: "String",
      optional: false,
      attributes: [{type: "attribute", kind: "field", name: "unique"}],
    })
 * ```
 */
export function addPrismaField(
  source: string,
  modelName: string,
  fieldProps: Field,
): Promise<string> {
  return produceSchema(source, (schema) => {
    const model = schema.list.find((x) => x.type === "model" && x.name === modelName) as Model
    if (!model) return

    const existing = model.properties.find((x) => x.type === "field" && x.name === fieldProps.name)
    existing ? Object.assign(existing, fieldProps) : model.properties.push(fieldProps)
  })
}
