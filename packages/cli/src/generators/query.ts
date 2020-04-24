import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import {log} from '@blitzjs/utils'

export interface QueryMutationGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  fileContext: string
}

class QueryGenerator extends Generator<QueryMutationGeneratorOptions> {
  static subdirectory = 'queries'
  static template = 'query'

  async write() {
    const templateValues = {
      modelName: this.options.modelName,
      modelNames: this.options.modelNames,
      ModelName: this.options.ModelName,
      ModelNames: this.options.ModelNames,
    }

    const paths = readDirRecursive(this.sourcePath())

    for (let path of paths) {
      try {
        this.fs.copyTpl(
          this.sourcePath(path),
          this.destinationPath(this.options.fileContext + path.replace('.ejs', '')),
          templateValues,
        )
      } catch (error) {
        log.error('Error generating' + path)
        throw error
      }
    }
  }

  async postWrite() {
    // log.success(`Successfully created queries for ${this.options.pluralName.toLocaleLowerCase()}`)
  }
}

export default QueryGenerator
