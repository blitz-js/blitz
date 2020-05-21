import {singlePascal, singleCamel, pluralCamel} from '../utils/plurals'

export enum FieldType {
  Boolean = 'Boolean',
  DateTime = 'DateTime',
  Float = 'Float',
  Int = 'Int',
  Json = 'Json',
  String = 'String',
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
const builtInGenerators = ['autoincrement', 'now', 'uuid', 'cuid']

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
    const [_modelName, _fieldType, attribute] = input.split(':')
    let modelName = singleCamel(_modelName)
    let fieldType = singlePascal(_fieldType)
    let isRequired = true
    let isList = false
    let isUpdatedAt = false
    let isUnique = false
    let defaultValue = undefined
    let relationFromFields = undefined
    let relationToFields = undefined
    let maybeIdField = undefined
    if (fieldType.includes('?')) {
      fieldType = fieldType.replace('?', '')
      isRequired = false
    }
    if (fieldType.includes('[]')) {
      fieldType = fieldType.replace('[]', '')
      modelName = pluralCamel(modelName)
      isList = true
    }
    // modelName should just be the typename at this point, validate
    if (!/^[A-Za-z]*$/.test(modelName)) {
      throw new Error(`[Field.parse]: received unknown special character in field name: ${modelName}`)
    }
    // @TODO: build out code for relations
    // // assume, if not a scalar type, that it's a relation
    // if (!Object.keys(FieldType).includes(fieldType)) {
    //   // if it's a list, this model has many of the other type, we just need the single field
    //   if (isList) {
    //     relationToFields = ['id']
    //   }
    //   // if not, we need an additional ID field for the singular association
    //   else {
    //     const idName = `${singleCamel(fieldType)}Id`
    //     relationFromFields = [idName]
    //     relationToFields = ['id']
    //     isRequired = false
    //     maybeIdField = new Field(idName, {
    //       type: 'Int?',
    //     })
    //   }
    // }

    if (/unique/i.test(attribute)) isUnique = true
    if (/updatedAt/i.test(attribute)) isUpdatedAt = true
    if (/default/i.test(attribute)) {
      if (defaultValueTest.test(attribute)) {
        const [, _defaultValue] = attribute.match(defaultValueTest)!
        defaultValue = builtInGenerators.includes(_defaultValue) ? {name: _defaultValue} : _defaultValue
      }
    }
    const parseResult = new Field(modelName, {
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
  }

  constructor(name: string, options: FieldArgs) {
    if (!name) throw new Error('[PrismaField]: no field name supplied')
    if (!options.type) {
      throw new Error(
        '[PrismaField]: invalid field type supplied. Expected a model name or a scalar Prisma type',
      )
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
      throw new Error('[PrismaField]: a type cannot be both optional and a list')
    }
    if (this.isId && this.default === undefined) {
      throw new Error('[PrismaField]: ID fields must have a default value')
    }
  }

  private getDefault() {
    if (this.default === undefined) return ''
    let defaultValue: string
    if (typeof this.default === 'object') {
      // { name: 'fnname' } is based off of the Prisma model definition
      defaultValue = `${this.default.name}()`
    } else {
      defaultValue = String(this.default)
    }
    return `@default(${defaultValue})`
  }

  private getId() {
    return this.isId ? '@id' : ''
  }

  private getIsUnique() {
    return this.isUnique ? '@unique' : ''
  }

  private getIsUpdatedAt() {
    return this.isUpdatedAt ? '@updatedAt' : ''
  }

  private getRelation() {
    if (this.relationFromFields === undefined || this.relationToFields === undefined) return ''
    const separator =
      this.relationToFields &&
      this.relationToFields.length > 0 &&
      this.relationFromFields &&
      this.relationFromFields.length
        ? ', '
        : ''
    const fromFields =
      this.relationFromFields && this.relationFromFields.length > 0
        ? `fields: [${this.relationFromFields.toString()}]`
        : ''

    const toFields =
      this.relationToFields && this.relationToFields.length > 0
        ? `fields: [${this.relationToFields.toString()}]`
        : ''
    return `@relation(${fromFields}${separator}${toFields})`
  }

  private getTypeModifiers() {
    return `${this.isRequired ? '' : '?'}${this.isList ? '[]' : ''}`
  }

  private getAttributes() {
    const possibleAttributes = [
      this.getId(),
      this.getDefault(),
      this.getIsUnique(),
      this.getIsUpdatedAt(),
      this.getRelation(),
    ]
    // filter out any attributes that return ''
    const attrs = possibleAttributes.filter((attr) => attr)
    if (attrs.length > 0) {
      return `  ${attrs.join(' ')}`
    }
    return ''
  }

  toString() {
    return `${this.name}  ${this.type}${this.getTypeModifiers()}${this.getAttributes()}`
  }
}
