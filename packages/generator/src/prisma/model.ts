import {Field, FieldType} from "./field"
import {singlePascal} from "../utils/plurals"

function stringifyFieldsForPrinting(fields: Field[]) {
  let maxNameLength = 1
  let maxTypeLength = 1
  for (let field of fields) {
    const [name, type] = field.toString().split(/[\s]+/)
    maxNameLength = Math.max(maxNameLength, name.length)
    maxTypeLength = Math.max(maxTypeLength, type.length)
  }
  // add horizontal padding, otherwise there would be no space after the type
  maxNameLength += 2
  maxTypeLength += 2
  return fields.map((field) => {
    const [name, type, ...rest] = field.toString().split(/[\s]+/)
    const attrs = rest.join(" ")
    const namePad = maxNameLength - name.length
    const typePad = maxTypeLength - type.length
    return `${name}${Array(namePad).join(" ")}${type}${Array(typePad).join(" ")}${attrs}`
  })
}

export class Model {
  name: string
  fields: Field[]

  constructor(name: string, fields: Field[] = []) {
    this.name = singlePascal(name)
    this.fields = fields
  }

  private getIdField() {
    return new Field("id", {
      isRequired: true,
      isList: false,
      isId: true,
      default: "autoincrement()",
      type: FieldType.Int,
    })
  }

  private getCreatedAtField() {
    return new Field("createdAt", {
      isRequired: true,
      isList: false,
      isId: false,
      default: "now()",
      type: FieldType.DateTime,
    })
  }

  private getUpdatedAtField() {
    return new Field("updatedAt", {
      isRequired: true,
      isList: false,
      isId: false,
      isUpdatedAt: true,
      type: FieldType.DateTime,
    })
  }

  private getFields() {
    return stringifyFieldsForPrinting([
      this.getIdField(),
      this.getCreatedAtField(),
      this.getUpdatedAtField(),
      ...this.fields,
    ])
      .map((field) => `\n  ${field}`)
      .join("")
  }

  toString() {
    return `model ${this.name} {${this.getFields()}\n}`
  }
}
