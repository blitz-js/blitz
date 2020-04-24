import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import {log} from '@blitzjs/server'

export interface AppGeneratorOptions extends GeneratorOptions {
  name: string
  pluralName: string
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
        this.fs.copyTpl(this.sourcePath(path), this.destinationPath(path.replace('.ejs', '')), templateValues)
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
