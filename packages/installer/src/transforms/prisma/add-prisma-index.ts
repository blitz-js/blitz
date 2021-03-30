import {merge, produceSchema} from "./produce-schema"
import {PrismaIndex} from "./types"

/**
 * Adds a field to a model in your schema.prisma data model.
 *
 * @remarks Not ready for actual use
 * @param source - schema.prisma source file contents
 * @param modelName - name of the model to add a field to
 * @param uniqueIndex - the index to add
 * @returns The modified schema.prisma source
 */
export function addPrismaIndex(
  source: string,
  modelName: string,
  uniqueIndex: PrismaIndex,
): Promise<string> {
  return produceSchema(source, ({doc}) => {
    const model = doc.datamodel.models.find((x) => x.name === modelName)
    if (!model) return

    const existing = model.uniqueIndexes.find((x) => x.name === uniqueIndex.name)
    existing ? merge(existing, uniqueIndex) : model.uniqueIndexes.push(uniqueIndex)
  })
}
