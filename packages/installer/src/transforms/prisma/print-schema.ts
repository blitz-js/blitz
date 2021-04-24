import {printSchema as printer, Schema} from "@mrleebo/prisma-ast"

/**
 * Takes the schema.prisma document parsed from @mrleebo/prisma-ast and
 * serializes it back to a schema.prisma source string. To ensure consistent
 * formatting and prettify the document, we also execute the
 * IntrospectionEngine from @prisma/sdk.
 *
 * @param schema - the parsed prisma schema
 * @returns the schema.prisma source string
 */
export function printSchema(schema: Schema): string {
  return printer(schema)
}
