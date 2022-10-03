import {Model, ModelAttribute} from "@mrleebo/prisma-ast"
import {produceSchema} from "./produce-schema"

/**
 * Adds a field to a model in your schema.prisma data model.
 *
 * @remarks Not ready for actual use
 * @param source - schema.prisma source file contents
 * @param modelName - name of the model to add a field to
 * @param attributeProps - the model attribute (such as an index) to add
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 * addPrismaModelAttribute(source, "Project", {
 *   type: "attribute",
 *   kind: "model",
 *   name: "index",
 *   args: [{ type: "attributeArgument", value: { type: "array", args: ["name"] } }]
 * });
 * ```
 */
export function addPrismaModelAttribute(
  source: string,
  modelName: string,
  attributeProps: ModelAttribute,
): Promise<string> {
  return produceSchema(source, (schema) => {
    const model = schema.list.find((x) => x.type === "model" && x.name === modelName) as Model
    if (!model) return

    const existing = model.properties.find(
      (x) => x.type === "attribute" && x.name === attributeProps.name,
    )

    existing ? Object.assign(existing, attributeProps) : model.properties.push(attributeProps)
  })
}
