import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import spawn from 'cross-spawn'
import chalk from 'chalk'
import username from 'username'

const themeColor = '6700AB'

export interface AppGeneratorOptions extends GeneratorOptions {
  appName: string
  yarn: boolean
}

class AppGenerator extends Generator<AppGeneratorOptions> {
  async write() {
    const templateValues = {
      name: this.options.appName,
      username: await username(),
    }

    const paths = readDirRecursive(this.sourcePath(), () => true)

    for (let path of paths) {
      this.fs.copyTpl(this.sourcePath(path), this.destinationPath(path), templateValues)
    }

    this.fs.move(this.destinationPath('gitignore'), this.destinationPath('.gitignore'))
  }

  async postWrite() {
    console.log(chalk.hex(themeColor).bold('\nInstalling dependencies...'))
    console.log('Scary warning messages during this part, are unfortunately normal.\n')

    const result = spawn.sync(this.options.yarn ? 'yarn' : 'npm', ['install'], {stdio: 'inherit'})
    if (result.status !== 0) {
      throw new Error()
    }

    console.log(chalk.hex(themeColor).bold('\nDependencies successfully installed.'))
  }
}

export default AppGenerator
