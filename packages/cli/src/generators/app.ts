import Generator, {GeneratorOptions} from '../generator'
import readDirRecursive from 'fs-readdir-recursive'
import spawn from 'cross-spawn'
import chalk from 'chalk'
import username from 'username'
import {readJSONSync, writeJson, writeSync, openSync, closeSync} from 'fs-extra'
import {join} from 'path'
import {replaceDependencies} from '../utils/replace-dependencies'
import {replaceBlitzDependency} from '../utils/replace-blitz-dependency'
import {log} from '@blitzjs/server'

const themeColor = '6700AB'

export interface AppGeneratorOptions extends GeneratorOptions {
  appName: string
  yarn: boolean
  version: string
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
    const pkgDependencies = Object.keys(pkg.dependencies)
    const pkgDevDependencies = Object.keys(pkg.devDependencies)

    console.log('') // New line needed
    const spinner = log.spinner(log.withBranded('Retrieving the freshest of dependencies')).start()

    const dependenciesArray = await Promise.all([
      replaceDependencies(pkg, pkgDependencies, 'dependencies'),
      replaceDependencies(pkg, pkgDevDependencies, 'devDependencies'),
    ])

    for (let i = 0; i < dependenciesArray.length; i++) {
      const {key, dependencies} = dependenciesArray[i]
      pkg[key] = replaceBlitzDependency(dependencies, this.options.version)
    }

    await writeJson(pkgJsonLocation, pkg, {spaces: 2})

    spinner.succeed()

    const logFile = openSync(this.destinationPath('blitz-log.log'), 'a')
    writeSync(logFile, `[START: ${new Date().toISOString()}]\n`)

    const installSpinner = log.spinner(log.withBranded('Installing those dependencies...')).start()

    const installStatus = await new Promise((resolve) => {
      const cp = spawn(this.options.yarn ? 'yarn' : 'npm', ['install'], {
        stdio: ['inherit', logFile, logFile],
      })
      cp.on('exit', resolve)
    })

    writeSync(logFile, `[END: ${new Date().toISOString()}]\n\n`)
    closeSync(logFile)

    if (installStatus !== 0) {
      installSpinner.fail()
      throw new Error('Failed to install dependencies.\nCheck blitz-log.log for more information.')
    }

    installSpinner.succeed()

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
