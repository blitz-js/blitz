import {DMMF} from "@prisma/generator-helper"
import {merge, produceSchema} from "./produce-schema"
import {PrismaEnum} from "./types"

/**
 * Adds an enum to your schema.prisma data model.
 *
 * @param source - schema.prisma source file contents
 * @param enumProps - the enum to add
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 * addPrismaEnum(source, {name: "Role", values: ["USER", "ADMIN"]})
 * ```
 */
export function addPrismaEnum(source: string, enumProps: PrismaEnum): Promise<string> {
  return produceSchema(source, ({doc}) => {
    const existing = doc.datamodel.enums.find((x) => x.name === enumProps.name)
    const enumerable: DMMF.DatamodelEnum = Object.assign(
      {},
      {
        ...enumProps,
        values: enumProps.values.map((name) => ({
          name,
          dbName: null,
        })) as DMMF.EnumValue[],
      },
    )
    existing ? merge(existing, enumerable) : doc.datamodel.enums.push(enumerable)
  })
}
