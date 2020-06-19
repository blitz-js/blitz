// based on https://github.com/AhmedElywa/prisma-tools/blob/master/packages/schema

import {existsSync, promises} from "fs"
import {join} from "path"

export type Field = {
  name: string
  type: string
  list: boolean
  required: boolean
  isId: boolean
  unique: boolean
  kind: "object" | "enum" | "scalar"
  map?: string
  relationField?: boolean
  documentation?: string
  relation?: {name?: string; fields?: string[]; references?: string[]}
}

export type Model = {
  name: string
  documentation?: string
  map?: string
  fields: Field[]
}

export type Enums = {
  name: string
  fields: string[]
}

export type SchemaObject = {models: Model[]; enums: Enums[]}

const lineArray = (line: string) =>
  line
    .replace(/[\n\r]/g, "")
    .split(" ")
    .filter((v) => v)

const getClassName = (lines: string[]) => lineArray(lines[0])[1]

const getMap = (line: string) => {
  const value = line.match(/@map\((.*?)\)/)

  if (value) {
    return value[1].replace(/name/, "").replace(":", "").replace(" ", "").replace(/"/g, "")
  }

  return undefined
}

const getRelation = (line: string) => {
  const relationString = line.match(/@relation\((.*?)\)/)

  if (relationString) {
    const relation: Field["relation"] = {}

    const name = relationString[1].match(/"(\w+)"/)

    if (name) {
      relation.name = name[1]
    }

    ;["fields", "references"].forEach((item) => {
      const pattern = new RegExp(`${item}:[\\s\\S]\\[(.*?)\\]`)

      const values = relationString[1].match(pattern)

      if (values) {
        const asArray = values[1]
          .replace(/ /g, "")
          .split(",")
          .filter((v) => v)

        if (asArray.length > 0) {
          relation[item as "fields" | "references"] = asArray
        }
      }
    })

    return relation
  }

  return undefined
}

const getSchemaInObject = (data: string) => {
  const modelsObject: SchemaObject = {
    models: [],
    enums: [],
  }

  const models = data.match(/model[\s\S]*?\}/g)

  const enums = data.match(/enum[\s\S]*?\}/g)

  if (models) {
    for (const model of models) {
      const lines = model.split(/\n/).filter((v) => v)

      const modelObject: Model = {
        name: getClassName(lines),
        fields: [],
      }

      let documentation = ""

      for (let i = 1; i + 1 < lines.length; i++) {
        const line = lineArray(lines[i])

        if (line[0].includes("//")) {
          documentation = documentation ? documentation + "\n" + line.join(" ") : line.join(" ")
        } else if (line[0].includes("@@")) {
          modelObject.map = getMap(lines[i])
        } else {
          const type = line[1].replace("?", "").replace("[]", "")

          const field: Field = {
            name: line[0],
            type,
            isId: line.includes("@id"),
            unique: line.includes("@unique"),
            list: line[1].includes("[]"),
            required: !line[1].includes("[]") && !line[1].includes("?"),
            kind: data.includes(`enum ${type} `)
              ? "enum"
              : data.includes(`model ${type} `)
              ? "object"
              : "scalar",
            documentation,
            map: getMap(lines[i]),
          }

          if (field.kind === "object") {
            field.relation = getRelation(lines[i])
          }

          modelObject.fields.push(field)

          documentation = ""
        }
      }

      modelObject.documentation = documentation

      modelObject.fields
        .filter((item) => item.kind !== "object")
        .forEach((item) => {
          let relationField = false

          modelObject.fields
            .filter((field) => field.kind === "object")
            .forEach((field) => {
              if (!relationField) {
                relationField = !!field.relation?.fields?.includes(item.name)
              }
            })

          item.relationField = relationField
        })

      modelsObject.models.push({...modelObject})
    }
  }

  if (enums) {
    for (const item of enums) {
      const lines = item.split(/\n/).filter((v) => v)

      const itemObject: Enums = {
        name: getClassName(lines),
        fields: [],
      }

      for (let i = 1; i + 1 < lines.length; i++) {
        const line = lineArray(lines[i])

        !line[0].includes("//") && itemObject.fields.push(line[0])
      }

      modelsObject.enums.push({...itemObject})
    }
  }

  return modelsObject
}

type GetSchemaInput = {
  path: string
}

const getSchema = async ({path}: GetSchemaInput) => {
  const schemaPath = join(path, "db", "schema.prisma")

  if (!existsSync(schemaPath)) {
    return
  }

  const data = await promises.readFile(schemaPath, "utf-8")

  return getSchemaInObject(data)
}

export default getSchema
