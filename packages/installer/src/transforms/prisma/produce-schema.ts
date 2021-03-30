import {PromiseReturnType} from "@blitzjs/core"
import {ConfigMetaFormat, getConfig, getDMMF} from "@prisma/sdk"
import {printSchema} from "./print-schema"
type Doc = PromiseReturnType<typeof getDMMF>

interface PrismaMetaSchema {
  doc: Doc
  config: ConfigMetaFormat
}

/**
 * A file transformer that parses a schema.prisma string, offers you a callback
 * of the parsed document object, then takes your changes to the document and
 * writes out a new schema.prisma string with the changes applied.
 *
 * @param source - schema.prisma source file contents
 * @param producer - a callback function that can mutate the parsed data model
 * @returns The modified schema.prisma source
 */
export async function produceSchema(source: string, producer: (schema: PrismaMetaSchema) => void) {
  const doc = await getDMMF({datamodel: source})
  const config = await getConfig({datamodel: source})

  producer({doc, config})
  return printSchema(doc, config)
}

export function merge<T>(target: T, source: T) {
  // TODO: this is a placeholder for a more developed solution
  // for deep-merging DMMF entries together. I don't really
  // know what that's going to look like yet.
  return Object.assign(target, source)
}
