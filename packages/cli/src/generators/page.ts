import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import chalk from 'chalk'

export interface AppGeneratorOptions extends GeneratorOptions {
  name: string
  pluralName: string
  context: string[]
}

class PageGenerator extends Generator<AppGeneratorOptions> {
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
          this.destinationPath(path.replace('.ejs', '').replace('__id__', '[id]')),
          templateValues,
        )
      } catch (error) {
        console.log('Error generating', path)
        throw error
      }
    }
  }

  async postWrite() {
    console.log(chalk.green(`Successfully created pages for ${this.options.pluralName}`))
  }
}

export default PageGenerator
