import {Datasource} from "@mrleebo/prisma-ast"
import {produceSchema} from "./produce-schema"

/**
 * Modify the prisma datasource metadata to use the provider and url specified.
 *
 * @param source - schema.prisma source file contents
 * @param datasourceProps - datasource object to assign to the schema
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 *  setPrismaDataSource(source, {
      type: "datasource",
      name: "db",
      assignments: [
        {type: "assignment", key: "provider", value: '"postgresql"'},
        {
          type: "assignment",
          key: "url",
          value: {type: "function", name: "env", params: ['"DATABASE_URL"']},
        },
      ],
    })
 * ```
 */
export function setPrismaDataSource(source: string, datasourceProps: Datasource): Promise<string> {
  return produceSchema(source, (schema) => {
    const existing = schema.list.find((x) => x.type === "datasource")
    existing ? Object.assign(existing, datasourceProps) : schema.list.push(datasourceProps)
  })
}
