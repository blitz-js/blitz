import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
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
  yarn: boolean
  version: string
  skipInstall: boolean
}

const ignoredNames = ['.blitz', '.DS_Store', '.git', '.next', '.now', 'node_modules']

class AppGenerator extends Generator<AppGeneratorOptions> {
  async write() {
    const templateValues = {
      name: this.options.appName,
      username: await username(),
    }

    const paths = readDirRecursive(this.sourcePath(), (name) => {
      return !ignoredNames.includes(name)
    })

    for (let path of paths) {
      try {
        this.fs.copyTpl(this.sourcePath(path), this.destinationPath(path.replace('.ejs', '')), templateValues)
      } catch (error) {
        console.log('Error generating', path)
        throw error
      }
    }

    this.fs.move(this.destinationPath('gitignore'), this.destinationPath('.gitignore'))
  }

  async postWrite() {
    const pkgJsonLocation = join(this.destinationPath(), 'package.json')
    const pkg = readJSONSync(pkgJsonLocation)

    console.log('') // New line needed
    const spinner = log.spinner(log.withBranded('Retrieving the freshest of dependencies')).start()

    const [
      [newDependencies, dependenciesUsedFallback],
      [newDevDependencies, devDependenciesUsedFallback],
      [blitzDependencyVersion, blitzUsedFallback],
    ] = await Promise.all([
      fetchLatestVersionsFor(pkg.dependencies),
      fetchLatestVersionsFor(pkg.devDependencies),
      getBlitzDependencyVersion(this.options.version),
    ])

    pkg.dependencies = newDependencies
    pkg.devDependencies = newDevDependencies
    pkg.dependencies.blitz = blitzDependencyVersion

    const fallbackUsed = dependenciesUsedFallback || devDependenciesUsedFallback || blitzUsedFallback

    await writeJson(pkgJsonLocation, pkg, {spaces: 2})

    spinner.succeed()

    if (!fallbackUsed && !this.options.skipInstall) {
      console.log(chalk.hex(themeColor).bold('\nInstalling those dependencies...'))
      console.log('Scary warning messages during this part are unfortunately normal.\n')

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
    } else {
      console.log(
        chalk
          .hex(themeColor)
          .bold(
            `\nThere seems to be some problem with your network. We'll skip installing your dependencies for now, make sure to compensate by running ${
              this.options.yarn ? "'yarn'" : "'npm install'"
            } once your connection is working again.`,
          ),
      )
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
