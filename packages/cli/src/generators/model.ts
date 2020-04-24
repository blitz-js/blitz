import Generator, {GeneratorOptions} from '../generator'
import enquirer from 'enquirer'
import path from 'path'
import {log} from '@blitzjs/server'

export interface AppGeneratorOptions extends GeneratorOptions {
  name: string
  pluralName: string
}

class ModelGenerator extends Generator<AppGeneratorOptions> {
  // default subdirectory is /app/[name], we need to back out of there to generate the model
  static subdirectory = '../..'
  static template = ''

  async write() {
    try {
      if (!this.fs.exists(path.resolve('db/schema.prisma'))) {
        throw new Error('Prisma schema file was not found')
      }
      const {fields: fieldsString} = await enquirer.prompt({
        name: 'fields',
        type: 'input',
        message: `Please input all fields which should exist on a ${this.options.name} as a space-separated list of key:value pairs.
An 'id' column will be auto-generated and should not be entered.
Modifiers can be denoted with a trailing '?' (e.g. 'lastname:string?' or 'users:User[]')`,
      })
      const fields = fieldsString.split(' ')
      let modelDefinition = `\nmodel ${this.options.name} {
  id  Int  @id @default(autoincrement())`
      for (const field of fields) {
        const [fieldName, fieldType] = field.split(':')
        modelDefinition += `\n  ${fieldName}  ${fieldType}`
      }
      modelDefinition += '\n}\n'
      this.fs.append(path.resolve('db/schema.prisma'), modelDefinition)
    } catch (error) {
      throw error
    }
  }

  async postWrite() {
    log.success(`Successfully created prisma model for ${this.options.name.toLocaleLowerCase()}`)
  }
}

export default ModelGenerator
