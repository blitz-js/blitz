import {Generator, GeneratorOptions} from '../generator'
import enquirer from 'enquirer'
import path from 'path'

export interface ModelGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  fileContext: string
}

export class ModelGenerator extends Generator<ModelGeneratorOptions> {
  // default subdirectory is /app/[name], we need to back out of there to generate the model
  static subdirectory = '../..'
  sourceRoot: string = ''

  async getTemplateValues() {}

  async write() {
    try {
      if (!this.fs.exists(path.resolve('db/schema.prisma'))) {
        throw new Error('Prisma schema file was not found')
      }
      const {fields: fieldsString} = await enquirer.prompt({
        name: 'fields',
        type: 'input',
        message: `Please input all fields which should exist on a ${this.options.ModelName} as a space-separated list of key:value pairs.
An 'id' column will be auto-generated and should not be entered.
Modifiers can be denoted with a trailing '?' (e.g. 'lastname:string?' or 'users:User[]')`,
      })
      const fields = fieldsString.split(' ')
      let modelDefinition = `\nmodel ${this.options.ModelName} {
  id      Int  @id @default(autoincrement())`
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
}
