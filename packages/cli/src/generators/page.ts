import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import {log} from '@blitzjs/server'

export interface AppGeneratorOptions extends GeneratorOptions {
  name: string
  pluralName: string
  fileContext: string
}

class PageGenerator extends Generator<AppGeneratorOptions> {
  static subdirectory = 'pages'
  static template = 'page'

  async write() {
    const templateValues = {
      name: this.options.name,
      pluralName: this.options.pluralName,
    }

    const paths = readDirRecursive(this.sourcePath())

    for (let path of paths) {
      try {
        this.fs.copyTpl(
          this.sourcePath(path),
          this.destinationPath(this.options.fileContext + path.replace('.ejs', '').replace('__id__', '[id]')),
          templateValues,
        )
      } catch (error) {
        log.error('Error generating' + path)
        throw error
      }
    }
  }

  async postWrite() {
    log.success(`Successfully created pages for ${this.options.pluralName.toLocaleLowerCase()}`)
  }
}

export default PageGenerator
