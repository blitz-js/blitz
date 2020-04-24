import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import chalk from 'chalk'

export interface AppGeneratorOptions extends GeneratorOptions {
  name: string
  pluralName: string
}

class QueryGenerator extends Generator<AppGeneratorOptions> {
  static subdirectory = 'queries'
  static template = 'query'

  async write() {
    const templateValues = {
      lowerCaseName: this.options.name.toLocaleLowerCase(),
      lowerCasePluralName: this.options.pluralName.toLocaleLowerCase(),
      name: this.options.name,
      pluralName: this.options.pluralName,
    }

    const paths = readDirRecursive(this.sourcePath())

    for (let path of paths) {
      try {
        this.fs.copyTpl(this.sourcePath(path), this.destinationPath(path.replace('.ejs', '')), templateValues)
      } catch (error) {
        console.log('Error generating', path)
        throw error
      }
    }
  }

  async postWrite() {
    console.log(
      chalk.green(`Successfully created queries for ${this.options.pluralName.toLocaleLowerCase()}`),
    )
  }
}

export default QueryGenerator
