import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import spawn from 'cross-spawn'
import chalk from 'chalk'

const themeColor = '6700AB'

export interface AppGeneratorOptions extends GeneratorOptions {
  appName: string
  yarn: boolean
}

class AppGenerator extends Generator<AppGeneratorOptions> {
  async write() {
    const templateValues = {
      name: this.options.appName,
    }

    const paths = readDirRecursive(this.sourcePath())

    for (let path of paths) {
      this.fs.copyTpl(this.sourcePath(path), this.destinationPath(path), templateValues)
    }
  }

  async postWrite() {
    console.log('\n' + chalk.hex(themeColor)('Installing dependencies...'))

    const result = spawn.sync(this.options.yarn ? 'yarn' : 'npm', ['install'], {stdio: 'inherit'})
    if (result.status !== 0) {
      throw new Error()
    }

    console.log(chalk.hex(themeColor)('Dependencies installed.'))
  }
}

export default AppGenerator
