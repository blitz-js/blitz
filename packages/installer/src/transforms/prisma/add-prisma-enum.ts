import {Enum} from "@mrleebo/prisma-ast"
import {produceSchema} from "./produce-schema"

/**
 * Adds an enum to your schema.prisma data model.
 *
 * @param source - schema.prisma source file contents
 * @param enumProps - the enum to add
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 *  addPrismaEnum(source, {
      type: "enum",
      name: "Role",
      enumerators: [
        {type: "enumerator", name: "USER"},
        {type: "enumerator", name: "ADMIN"},
      ],
    })
 * ```
 */
export function addPrismaEnum(source: string, enumProps: Enum): Promise<string> {
  return produceSchema(source, (schema) => {
    const existing = schema.list.find((x) => x.type === "enum" && x.name === enumProps.name)
    existing ? Object.assign(existing, enumProps) : schema.list.push(enumProps)
  })
}
