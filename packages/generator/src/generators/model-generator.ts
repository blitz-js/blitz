import {Generator, GeneratorOptions} from '../generator'
import path from 'path'
import {Model} from '../prisma/model'
import {Field} from '../prisma/field'

export interface ModelGeneratorOptions extends GeneratorOptions {
  modelName: string
  extraArgs: string[]
}

export class ModelGenerator extends Generator<ModelGeneratorOptions> {
  // default subdirectory is /app/[name], we need to back out of there to generate the model
  static subdirectory = '../..'
  sourceRoot: string = ''
  unsafe_disableConflictChecker = true

  async getTemplateValues() {}

  getTargetDirectory() {
    return ''
  }

  async write() {
    try {
      if (!this.fs.exists(path.resolve('db/schema.prisma'))) {
        throw new Error('Prisma schema file was not found')
      }
      const modelDefinition = new Model(
        this.options.modelName,
        this.options.extraArgs.flatMap((def) => Field.parse(def)),
      )
      // wrap in newlines to put a space below the previously generated model and
      // to preserve the EOF newline
      this.fs.append(path.resolve('db/schema.prisma'), `\n${modelDefinition.toString()}\n`)
    } catch (error) {
      throw error
    }
  }
}
