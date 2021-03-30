import {DMMF} from "@prisma/generator-helper"
import {merge, produceSchema} from "./produce-schema"
import {PrismaModel} from "./types"

/**
 * Adds an enum to your schema.prisma data model.
 *
 * @param source - schema.prisma source file contents
 * @param modelProps - the model to add
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 * addPrismaModel(source, {name: "Project", fields: [{name: "id", type: "Int", isId: true}]})
 * ```
 */
export function addPrismaModel(source: string, modelProps: PrismaModel): Promise<string> {
  return produceSchema(source, ({doc}) => {
    const existing = doc.datamodel.models.find((x) => x.name === model.name)
    const model: DMMF.Model = Object.assign(
      {isEmbedded: false, dbName: null, uniqueFields: [], uniqueIndexes: [], idFields: []},
      modelProps,
    )
    existing ? merge(existing, model) : doc.datamodel.models.push(model)
  })
}
