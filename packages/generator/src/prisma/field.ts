import * as ast from "@mrleebo/prisma-ast"
import {capitalize, singlePascal, uncapitalize} from "../utils/inflector"

export enum FieldType {
  Boolean = "Boolean",
  DateTime = "DateTime",
  Float = "Float",
  Int = "Int",
  Json = "Json",
  String = "String",
  Uuid = "Uuid",
}

export enum Relation {
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

const defaultValueTest = /=([\w]+)$/
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
  static parse(input: string, schema?: ast.Schema): Field[] {
    const [_fieldName, _fieldType = "String", _attribute] = input.split(":")
    let attribute = _attribute as string
    let fieldName = uncapitalize(_fieldName as string)
    let fieldType = capitalize(_fieldType)
    const isId = fieldName === "id"
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
    if (fieldType === FieldType.Uuid) {
      fieldType = FieldType.String
      attribute = "default=uuid"
    }
    // use original unmodified field name in case the list handling code
    // has modified fieldName
    if (isRelation(_fieldName as string)) {
      // this field is an object type, not a scalar type
      const relationType = Relation[_fieldName]
      // translate the type into the name since they should stay in sync
      fieldName = uncapitalize(fieldType)
      fieldType = singlePascal(fieldType)

      switch (relationType) {
        case Relation.belongsTo:
          // current model gets two fields:
          //   modelName    ModelName   @relation(fields: [modelNameId], references: [id])
          //   modelNameId  ModelIdType
          const idFieldName = `${fieldName}Id`
          relationFromFields = [idFieldName]
          relationToFields = ["id"]

          const relationModel = schema?.list.find(function (component): component is ast.Model {
            return component.type === "model" && component.name === fieldType
          })
          const relationField =
            relationModel &&
            relationModel.properties.find(function (prop): prop is ast.Field {
              return prop.type === "field" && prop.name === "id"
            })

          maybeIdField = new Field(idFieldName, {
            // find the matching field based on the relation and, if found, match its field type
            type: relationField ? (relationField.fieldType as FieldType) : FieldType.Int,
            isRequired,
          })
          isList = false
          break
      }
    }
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(fieldName)) {
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
        defaultValue = builtInGenerators.includes(_defaultValue as string)
          ? {type: "function", name: _defaultValue, params: []}
          : _defaultValue
      }
    }
    try {
      const parseResult = new Field(fieldName, {
        default: defaultValue,
        isId,
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
          `Each field in a model must have a name, but you supplied ${input}.\n
           Try giving the field as a "name:type" pair, such as "description:string".`,
        )
      }
      throw err
    }
  }

  constructor(name: string, options: FieldArgs) {
    if (!name) throw new MissingFieldNameError("[PrismaField]: A field name is required")
    if (!options.type) {
      console.warn(`No field type specified for field ${name}, falling back to "String".`)
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

  appendTo(model: ast.Model) {
    if (model.properties.some((prop) => prop.type === "field" && prop.name === this.name)) return

    const attributes = [
      this.getId(),
      this.getIsUnique(),
      this.getDefault(),
      this.getIsUpdatedAt(),
      this.getRelation(),
    ].filter(Boolean) as ast.Attribute[]

    model.properties.push({
      type: "field",
      name: this.name,
      fieldType: this.type,
      optional: !this.isRequired,
      array: this.isList,
      attributes,
    })
  }

  private getDefault(): ast.Attribute | undefined {
    if (this.default == null) return

    return {
      type: "attribute",
      kind: "field",
      name: "default",
      args: [
        {
          type: "attributeArgument",
          value: typeof this.default === "object" ? `${this.default.name}()` : String(this.default),
        },
      ],
    }
  }

  private getId(): ast.Attribute | undefined {
    if (!this.isId) return

    return {
      type: "attribute",
      kind: "field",
      name: "id",
    }
  }

  private getIsUnique(): ast.Attribute | undefined {
    if (!this.isUnique) return
    return {type: "attribute", kind: "field", name: "unique"}
  }

  private getIsUpdatedAt(): ast.Attribute | undefined {
    if (!this.isUpdatedAt) return
    return {type: "attribute", kind: "field", name: "updatedAt"}
  }

  private getRelation(): ast.Attribute | undefined {
    if (this.relationFromFields == null || this.relationToFields == null) return

    return {
      type: "attribute",
      kind: "field",
      name: "relation",
      args: [
        {
          type: "attributeArgument",
          value: {
            type: "keyValue",
            key: "fields",
            value: {type: "array", args: this.relationFromFields},
          },
        },
        {
          type: "attributeArgument",
          value: {
            type: "keyValue",
            key: "references",
            value: {type: "array", args: this.relationToFields},
          },
        },
      ],
    }
  }
}
