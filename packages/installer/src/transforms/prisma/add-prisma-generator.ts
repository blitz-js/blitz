import {merge, produceSchema} from "./produce-schema"
import {PrismaGenerator} from "./types"

/**
 * Adds a generator to your schema.prisma data model.
 *
 * @param source - schema.prisma source file contents
 * @param generator - the generator to add
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 * addPrismaGenerator(source, {name: "nexusPrisma", provider: "nexus-prisma"})
 * ```
 */
export function addPrismaGenerator(source: string, generator: PrismaGenerator): Promise<string> {
  return produceSchema(source, ({config}) => {
    const existing = config.generators.find((x) => x.name === generator.name)
    existing
      ? merge(existing, generator)
      : config.generators.push(
          Object.assign(
            {output: null, config: {}, binaryTargets: [], previewFeatures: []},
            generator,
          ),
        )
  })
}
