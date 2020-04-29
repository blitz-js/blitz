import Generator, {GeneratorOptions} from '../generator'
import spawn from 'cross-spawn'
import chalk from 'chalk'
import username from 'username'
import {readJSONSync, writeJson} from 'fs-extra'
import {join} from 'path'
import {fetchLatestVersionsFor} from '../utils/fetch-latest-version-for'
import {log} from '@blitzjs/server'
import {getBlitzDependencyVersion} from '../utils/get-blitz-dependency-version'

const themeColor = '6700AB'

export interface AppGeneratorOptions extends GeneratorOptions {
  appName: string
  useTs: boolean
  yarn: boolean
  version: string
  skipInstall: boolean
}

class AppGenerator extends Generator<AppGeneratorOptions> {
  filesToIgnore() {
    if (!this.options.useTs) {
      return ['tsconfig.json']
    }
    return []
  }

  async getTemplateValues() {
    return {
      name: this.options.appName,
      username: await username(),
    }
  }

  async preCommit() {
    this.fs.move(this.destinationPath('gitignore'), this.destinationPath('.gitignore'))
  }

  async postWrite() {
    const pkgJsonLocation = join(this.destinationPath(), 'package.json')
    const pkg = readJSONSync(pkgJsonLocation)

    console.log('') // New line needed
    const spinner = log.spinner(log.withBranded('Retrieving the freshest of dependencies')).start()

    const [newDependencies, newDevDependencies, newBlitzVersion] = await Promise.all([
      fetchLatestVersionsFor(pkg.dependencies),
      fetchLatestVersionsFor(pkg.devDependencies),
      getBlitzDependencyVersion(this.options.version),
    ])

    pkg.dependencies = newDependencies
    pkg.devDependencies = newDevDependencies
    pkg.dependencies.blitz = newBlitzVersion

    await writeJson(pkgJsonLocation, pkg, {spaces: 2})

    spinner.succeed()

    console.log(chalk.hex(themeColor).bold('\nInstalling those dependencies...'))
    console.log('Scary warning messages during this part are unfortunately normal.\n')

    if (!this.options.skipInstall) {
      const result = spawn.sync(this.options.yarn ? 'yarn' : 'npm', ['install'], {stdio: 'inherit'})
      if (result.status !== 0) {
        throw new Error()
      }

      console.log(chalk.hex(themeColor).bold('\nDependencies successfully installed.'))

      // Ensure the generated files are formatted with the installed prettier version
      const prettierResult = spawn.sync(
        this.options.yarn ? 'yarn' : 'npm',
        'run prettier --loglevel silent --write .'.split(' '),
        {
          stdio: 'ignore',
        },
      )
      if (prettierResult.status !== 0) {
        throw new Error('Failed running prettier')
      }
    }

    // TODO: someone please clean up this ugly code :D
    // Currently aren't failing the generation process if git repo creation fails
    const gitResult1 = spawn.sync('git', ['init'], {
      stdio: 'ignore',
    })
    if (gitResult1.status === 0) {
      const gitResult2 = spawn.sync('git', ['add', '.'], {
        stdio: 'ignore',
      })
      if (gitResult2.status === 0) {
        const gitResult3 = spawn.sync('git', ['commit', '-m', 'New baby Blitz app!'], {
          stdio: 'ignore',
        })
        if (gitResult3.status !== 0) {
          console.error('Failed to run git commit')
        }
      } else {
        console.error('Failed to run git add')
      }
    } else {
      console.error('Failed to run git init')
    }
  }
}

export default AppGenerator
