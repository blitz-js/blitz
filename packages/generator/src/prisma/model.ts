import {Field} from './field'
import {singlePascal} from '../utils/plurals'

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
    const attrs = rest.join(' ')
    const namePad = maxNameLength - name.length
    const typePad = maxTypeLength - type.length
    return `${name}${Array(namePad).join(' ')}${type}${Array(typePad).join(' ')}${attrs}`
  })
}

export class Model {
  name: string
  fields: Field[]

  constructor(name: string, fields: Field[] = []) {
    this.name = singlePascal(name)
    this.fields = fields
  }

  private getFields() {
    return stringifyFieldsForPrinting(this.fields)
      .map((field) => `\n  ${field}`)
      .join('')
  }

  toString() {
    return `model ${this.name} {${this.getFields()}\n}`
  }
}
