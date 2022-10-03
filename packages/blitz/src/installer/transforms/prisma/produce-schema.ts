import {getSchema, printSchema, Schema} from "@mrleebo/prisma-ast"

/**
 * A file transformer that parses a schema.prisma string, offers you a callback
 * of the parsed document object, then takes your changes to the document and
 * writes out a new schema.prisma string with the changes applied.
 *
 * @param source - schema.prisma source file contents
 * @param producer - a callback function that can mutate the parsed data model
 * @returns The modified schema.prisma source
 */
export async function produceSchema(
  source: string,
  producer: (schema: Schema) => void,
): Promise<string> {
  const schema = await getSchema(source)
  producer(schema)
  return printSchema(schema)
}
