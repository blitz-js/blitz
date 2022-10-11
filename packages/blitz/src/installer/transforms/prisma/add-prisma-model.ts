import {Model} from "@mrleebo/prisma-ast"
import {produceSchema} from "./produce-schema"

/**
 * Adds an enum to your schema.prisma data model.
 *
 * @param source - schema.prisma source file contents
 * @param modelProps - the model to add
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 *  addPrismaModel(source, {
      type: "model",
      name: "Project",
      properties: [{type: "field", name: "id", fieldType: "String"}],
    })
 * ```
 */
export function addPrismaModel(source: string, modelProps: Model): Promise<string> {
  return produceSchema(source, (schema) => {
    const existing = schema.list.find((x) => x.type === "model" && x.name === modelProps.name)
    existing ? Object.assign(existing, modelProps) : schema.list.push(modelProps)
  })
}
