import {log} from "@blitzjs/display"
import {capitalize, singlePascal, uncapitalize} from "../utils/plurals"

export enum FieldType {
  Boolean = "Boolean",
  DateTime = "DateTime",
  Float = "Float",
  Int = "Int",
  Json = "Json",
  String = "String",
}

export enum Relation {
  hasOne,
  hasMany,
  belongsTo,
}

function isRelation(maybeRelation: string): maybeRelation is keyof typeof Relation {
  return Object.keys(Relation).includes(maybeRelation)
}

interface FieldArgs {
  default?: any
  isId?: boolean
  isList?: boolean
  isRequired?: boolean
  isUnique?: boolean
  isUpdatedAt?: boolean
  type: FieldType | string
  relationFromFields?: string[]
  relationToFields?: string[]
}

const fallbackIfUndef = <T extends any>(defaultValue: T, input?: T) => {
  if (input === undefined) return defaultValue
  return input
}

const defaultValueTest = /\[([\w]+)\]/
const builtInGenerators = ["autoincrement", "now", "uuid", "cuid"]

class MissingFieldNameError extends Error {}

export class Field {
  default?: any
  name: string
  isId: boolean
  isList: boolean
  isRequired: boolean
  isUnique: boolean
  isUpdatedAt: boolean
  type: FieldType | string
  relationFromFields?: string[]
  relationToFields?: string[]

  // 'name:type?[]:attribute' => Field
  static parse(input: string): Field[] {
    const [_fieldName, _fieldType = "String", attribute] = input.split(":")
    let fieldName = uncapitalize(_fieldName)
    let fieldType = capitalize(_fieldType)
    let isRequired = true
    let isList = false
    let isUpdatedAt = false
    let isUnique = false
    let defaultValue = undefined
    let relationFromFields = undefined
    let relationToFields = undefined
    let maybeIdField = undefined
    if (fieldType.includes("?")) {
      fieldType = fieldType.replace("?", "")
      isRequired = false
    }
    if (fieldType.includes("[]")) {
      fieldType = fieldType.replace("[]", "")
      fieldName = uncapitalize(fieldName)
      isList = true
    }
    // use original unmodified field name in case the list handling code
    // has modified fieldName
    if (isRelation(_fieldName)) {
      // this field is an object type, not a scalar type
      const relationType = Relation[_fieldName]
      // translate the type into the name since they should stay in sync
      fieldName = uncapitalize(fieldType)
      fieldType = singlePascal(fieldType)

      switch (relationType) {
        case Relation.hasOne:
          // current model gets single association field
          isList = false
          break
        case Relation.hasMany:
          // current model gets single association field
          fieldName = uncapitalize(fieldName)
          isList = true
          isRequired = true
          break
        case Relation.belongsTo:
          // current model gets two fields:
          //   modelName    ModelName   @relation(fields: [modelNameId], references: [id])
          //   modelNameId  ModelIdType
          const idFieldName = `${fieldName}Id`
          relationFromFields = [idFieldName]
          relationToFields = ["id"]
          maybeIdField = new Field(idFieldName, {type: FieldType.Int, isRequired})
          isList = false
          break
      }
    }
    if (!/^[A-Za-z]*$/.test(fieldName)) {
      // modelName should be just alpha characters at this point, validate
      throw new Error(
        `[Field.parse]: received unknown special character in field name: ${fieldName}`,
      )
    }

    if (/unique/i.test(attribute)) isUnique = true
    if (/updatedAt/i.test(attribute)) isUpdatedAt = true
    if (/default/i.test(attribute)) {
      if (defaultValueTest.test(attribute)) {
        const [, _defaultValue] = attribute.match(defaultValueTest)!
        defaultValue = builtInGenerators.includes(_defaultValue)
          ? {name: _defaultValue}
          : _defaultValue
      }
    }
    try {
      const parseResult = new Field(fieldName, {
        default: defaultValue,
        isId: false,
        isList,
        isRequired,
        isUnique,
        isUpdatedAt,
        relationFromFields,
        relationToFields,
        type: fieldType,
      })
      return maybeIdField ? [parseResult, maybeIdField] : [parseResult]
    } catch (err) {
      if (err instanceof MissingFieldNameError) {
        throw new Error(
          `Each field in a model must have a name, but you supplied ${log.variable(
            input,
          )}.\n         Try giving the field as a ${log.variable(
            "name:type",
          )} pair, such as ${log.variable("description:string")}.`,
        )
      }
      throw err
    }
  }

  constructor(name: string, options: FieldArgs) {
    if (!name) throw new MissingFieldNameError("[PrismaField]: A field name is required")
    if (!options.type) {
      log.warning(
        `No field type specified for field ${log.variable(name)}, falling back to ${log.variable(
          "String",
        )}.`,
      )
      options.type = FieldType.String
    }
    this.name = name
    this.isList = fallbackIfUndef(false, options.isList)
    this.isRequired = fallbackIfUndef(true, options.isRequired)
    this.isUnique = fallbackIfUndef(false, options.isUnique)
    this.isId = fallbackIfUndef(false, options.isId)
    this.type = options.type
    this.default = options.default
    this.isUpdatedAt = fallbackIfUndef(false, options.isUpdatedAt)
    this.relationFromFields = options.relationFromFields
    this.relationToFields = options.relationToFields
    if (!this.isRequired && this.isList) {
      throw new Error("[PrismaField]: a type cannot be both optional and a list")
    }
    if (this.isId && this.default === undefined) {
      throw new Error("[PrismaField]: ID fields must have a default value")
    }
  }

  private getDefault() {
    if (this.default === undefined) return ""
    let defaultValue: string
    if (typeof this.default === "object") {
      // { name: 'fnname' } is based off of the Prisma model definition
      defaultValue = `${this.default.name}()`
    } else {
      defaultValue = String(this.default)
    }
    return `@default(${defaultValue})`
  }

  private getId() {
    return this.isId ? "@id" : ""
  }

  private getIsUnique() {
    return this.isUnique ? "@unique" : ""
  }

  private getIsUpdatedAt() {
    return this.isUpdatedAt ? "@updatedAt" : ""
  }

  private getRelation() {
    if (this.relationFromFields === undefined || this.relationToFields === undefined) return ""
    const separator =
      this.relationToFields &&
      this.relationToFields.length > 0 &&
      this.relationFromFields &&
      this.relationFromFields.length
        ? ", "
        : ""
    const fromFields =
      this.relationFromFields && this.relationFromFields.length > 0
        ? `fields: [${this.relationFromFields.toString()}]`
        : ""

    const toFields =
      this.relationToFields && this.relationToFields.length > 0
        ? `references: [${this.relationToFields.toString()}]`
        : ""
    return `@relation(${fromFields}${separator}${toFields})`
  }

  private getTypeModifiers() {
    return `${this.isRequired ? "" : "?"}${this.isList ? "[]" : ""}`
  }

  private getAttributes() {
    const possibleAttributes = [
      this.getDefault(),
      this.getId(),
      this.getIsUnique(),
      this.getIsUpdatedAt(),
      this.getRelation(),
    ]
    // filter out any attributes that return ''
    const attrs = possibleAttributes.filter((attr) => attr)
    if (attrs.length > 0) {
      return `  ${attrs.join(" ")}`
    }
    return ""
  }

  toString() {
    return `${this.name}  ${this.type}${this.getTypeModifiers()}${this.getAttributes()}`
  }
}
