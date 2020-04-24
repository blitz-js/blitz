import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import chalk from 'chalk'

export interface AppGeneratorOptions extends GeneratorOptions {
  name: string
  pluralName: string
}

class Mutation extends Generator<AppGeneratorOptions> {
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
        console.log('Error generating', path)
        throw error
      }
    }
  }

  async postWrite() {
    console.log(
      chalk.green(`Successfully created mutations for ${this.options.pluralName.toLocaleLowerCase()}`),
    )
  }
}

export default Mutation
