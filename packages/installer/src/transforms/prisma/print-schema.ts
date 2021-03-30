import {DataSource, DMMF, GeneratorConfig} from "@prisma/generator-helper"
import {ConfigMetaFormat, IntrospectionEngine} from "@prisma/sdk"

/**
 * Takes the schema.prisma document parsed from @prisma/sdk and serializes it
 * back to a schema.prisma source string. Since the SDK doesn't parse the whole
 * data model, we also execute the IntrospectionEngine to fill in the remaining
 * details and prettify the source code.
 *
 * @param doc - the document containing data model
 * @param config - the configuration containing the data sources and generators
 * @returns the schema.prisma source string
 */
export async function printSchema(doc: DMMF.Document, config: ConfigMetaFormat): Promise<string> {
  let aspects = []
  aspects.push(...config.datasources.map(printDatasource))
  aspects.push(...config.generators.map(printGenerator))
  aspects.push(...doc.datamodel.models.map(printModel))
  aspects.push(...doc.datamodel.enums.map(printEnum))
  const schema = aspects.filter(Boolean).join("\n")

  // The IntrospectionEngine can examine the existing data model and add any
  // aspects that are missing from the schema document, such as indexes, but
  // there is no database to inspect when running tests so we'll skip it for
  // now.
  if (process.env.NODE_ENV === "test") return schema

  const engine = new IntrospectionEngine()
  const {datamodel, warnings} = await engine.introspect(schema, false)

  // TODO: something besides console.warn() here
  if (warnings && warnings.length > 0) console.warn(warnings)
  return datamodel
}

function printDatasource({name, activeProvider, url}: DataSource) {
  const children = [
    activeProvider && `provider = "${activeProvider}"`,
    url && url.fromEnvVar ? `url      = env("${url.fromEnvVar}")` : `url      = "${url.value}"`,
  ]
    .filter(Boolean)
    .join("\n  ")

  return `datasource ${name} {
  ${children}
}`
}

function printGenerator({name, provider, output, binaryTargets, previewFeatures}: GeneratorConfig) {
  const children = [
    provider && `provider        = "${provider}"`,
    output && `output          = "${output}"`,
    binaryTargets.length > 0 && `binaryTargets   = ${JSON.stringify(binaryTargets)}`,
    previewFeatures.length > 0 && `previewFeatures = ${JSON.stringify(previewFeatures)}`,
  ]
    .filter(Boolean)
    .join("\n  ")

  return `generator ${name} {
  ${children}
}`
}

function printModel(model: DMMF.Model) {
  const {name, fields, uniqueFields, dbName, idFields} = model
  const children = []
  children.push(
    ...fields.map((field) => {
      const {name, type, isList, isRequired, kind} = field
      const modifier = isList ? "[]" : isRequired ? "" : "?"
      if (kind === "unsupported") return `${name} Unsupported("${type}")`
      return `${name} ${type}${modifier} ${printAttributes(field)}`
    }),
  )

  if (uniqueFields)
    children.push(...uniqueFields.map((fields) => `@@unique([${fields.join(", ")}])`))
  if (dbName) children.push(`@@map(${dbName})`)
  if (idFields && idFields.length > 0) children.push(`@@id([${fields.join(", ")}])`)

  return `model ${name} {
  ${children.filter(Boolean).join("\n  ")}
}`
}

function printEnum({name, values}: DMMF.DatamodelEnum): string {
  const children = values
    .map((e) => e.name)
    .filter(Boolean)
    .join("\n  ")

  return `enum ${name} {
  ${children}
}`
}

function printAttributes(field: DMMF.Field): string {
  const {
    isId,
    isUnique,
    isUpdatedAt,
    columnName,
    relationName,
    relationToFields,
    relationFromFields,
    default: defaultValue,
  } = field

  const attributes = []

  if (isId) attributes.push("@id")
  if (isUnique) attributes.push("@unique")
  if (columnName) attributes.push(`@map("${columnName}")`)
  if (relationName) {
    const relation: [[string, string]] = [["name", `"${relationName}"`]]

    if (relationFromFields && relationFromFields.length > 0)
      relation.push(["fields", relationFromFields])

    if (relationToFields && relationToFields.length > 0)
      relation.push(["references", relationToFields.join(", ")])

    attributes.push(`@relation(${relation.map((rel) => rel.join(": "))})`)
  }
  if (isUpdatedAt) attributes.push("@updatedAt")
  if (defaultValue)
    attributes.push(
      `@default(${
        isFieldDefault(defaultValue)
          ? `${defaultValue.name}(${defaultValue.args})`
          : JSON.stringify(defaultValue)
      })`,
    )

  return attributes.join(" ")
}

function isFieldDefault(object: any): object is DMMF.FieldDefault {
  return typeof object === "object" && "name" in object && "args" in object
}
