import {Generator} from "@mrleebo/prisma-ast"
import {produceSchema} from "./produce-schema"

/**
 * Adds a generator to your schema.prisma data model.
 *
 * @param source - schema.prisma source file contents
 * @param generatorProps - the generator to add
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 *  addPrismaGenerator(source, {
      type: "generator",
      name: "nexusPrisma",
      assignments: [{type: "assignment", key: "provider", value: '"nexus-prisma"'}],
    })
 * ```
 */
export function addPrismaGenerator(source: string, generatorProps: Generator): Promise<string> {
  return produceSchema(source, (schema) => {
    const existing = schema.list.find(
      (x) => x.type === "generator" && x.name === generatorProps.name,
    ) as Generator
    existing ? Object.assign(existing, generatorProps) : schema.list.push(generatorProps)
  })
}
