import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import {log} from '@blitzjs/server'
import {join} from 'path'

export interface PageGeneratorOptions extends GeneratorOptions {
  ModelName: string
  ModelNames: string
  modelName: string
  modelNames: string
  fileContext: string
}

class PageGenerator extends Generator<PageGeneratorOptions> {
  static subdirectory = 'pages'
  static template = 'page'

  async write() {
    const templateValues = {
      modelName: this.options.modelName,
      modelNames: this.options.modelNames,
      ModelName: this.options.ModelName,
      ModelNames: this.options.ModelNames,
    }

    const paths = readDirRecursive(this.sourcePath())
    console.log(this.options.fileContext)
    console.log(paths)

    for (let path of paths) {
      try {
        this.fs.copyTpl(
          this.sourcePath(path),
          this.destinationPath(
            join(
              this.options.fileContext,
              this.options.modelNames,
              path.replace('.ejs', '').replace('__id__', '[id]'),
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
    // log.success(`Successfully created pages for ${this.options.pluralName.toLocaleLowerCase()}`)
  }
}

export default PageGenerator
