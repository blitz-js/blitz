import {printSchema as printer, Schema} from "@mrleebo/prisma-ast"
import {IntrospectionEngine} from "@prisma/sdk"

/**
 * Takes the schema.prisma document parsed from @mrleebo/prisma-ast and
 * serializes it back to a schema.prisma source string. To ensure consistent
 * formatting and prettify the document, we also execute the
 * IntrospectionEngine from @prisma/sdk.
 *
 * @param schema - the parsed prisma schema
 * @returns the schema.prisma source string
 */
export async function printSchema(schema: Schema): Promise<string> {
  const source = await printer(schema)

  // The IntrospectionEngine can examine the existing data model and add any
  // aspects that are missing from the schema document, such as indexes, but
  // there is no database to inspect when running tests so we'll skip it for
  // now.
  if (process.env.NODE_ENV === "test") return source

  const engine = new IntrospectionEngine()
  const {datamodel, warnings} = await engine.introspect(source, false)

  // TODO: something besides console.warn() here
  if (warnings && warnings.length > 0) console.warn(warnings)
  return datamodel
}
