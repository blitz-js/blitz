import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import {log} from '@blitzjs/server'

export interface AppGeneratorOptions extends GeneratorOptions {
  name: string
  pluralName: string
  fileContext: string
}

class MutationGenerator extends Generator<AppGeneratorOptions> {
  static subdirectory = 'mutations'
  static template = 'mutation'

  async write() {
    const templateValues = {
      name: this.options.name,
      lowerCaseName: this.options.name.toLocaleLowerCase(),
    }

    const paths = readDirRecursive(this.sourcePath())

    for (let path of paths) {
      try {
        console.log(this.options.fileContext, path)
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
    log.success(`Successfully created mutations for ${this.options.pluralName.toLocaleLowerCase()}`)
  }
}

export default MutationGenerator
