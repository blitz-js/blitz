import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import {log} from '@blitzjs/server'
import {join} from 'path'

export interface MutationGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  fileContext: string
}

class MutationGenerator extends Generator<MutationGeneratorOptions> {
  static subdirectory = 'mutations'
  static template = 'mutation'

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
          this.destinationPath(
            join(
              this.options.fileContext,
              path
                .replace('.ejs', '')
                .replace('__ModelName__', this.options.ModelName)
                .replace('__ModelNames__', this.options.ModelNames),
            ),
          ),
          templateValues,
        )
      } catch (error) {
        log.error('Error generating' + path)
        throw error
      }
    }
  }

  async postWrite() {
    // log.success(`Successfully created mutations for ${this.options.pluralName.toLocaleLowerCase()}`)
  }
}

export default MutationGenerator
