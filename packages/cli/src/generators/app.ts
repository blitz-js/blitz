import Generator, {GeneratorOptions} from '../generator'
import spawn from 'cross-spawn'
import username from 'username'
import {readJSONSync, writeJson} from 'fs-extra'
import {join} from 'path'
import {replaceDependencies} from '../utils/replace-dependencies'
import {replaceBlitzDependency} from '../utils/replace-blitz-dependency'
import {log} from '@blitzjs/server'

export interface AppGeneratorOptions extends GeneratorOptions {
  appName: string
  useTs: boolean
  yarn: boolean
  version: string
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

    await new Promise((resolve) => {
      const logFlag = this.options.yarn ? '--json' : ''
      const cp = spawn(this.options.yarn ? 'yarn' : 'npm', ['install', logFlag], {
        stdio: ['inherit', 'pipe', 'pipe'],
      })

      const getJSON = (data: string) => {
        try {
          return JSON.parse(data)
        } catch {
          return null
        }
      }

      const spinners: any[] = []

      if (this.options.yarn) {
        cp.stdout?.setEncoding('utf8')
        cp.stderr?.setEncoding('utf8')
        cp.stdout?.on('data', (data) => {
          let json = getJSON(data)
          if (json && json.type === 'step') {
            spinners[spinners.length - 1]?.succeed()
            const spinner = log.spinner(log.withBranded(json.data.message)).start()
            spinners.push(spinner)
          }
          if (json && json.type === 'success') {
            spinners[spinners.length - 1]?.succeed()
          }
        })
        cp.stderr?.on('data', (data) => {
          let json = getJSON(data)
          if (json && json.type === 'error') {
            spinners[spinners.length - 1]?.fail()
            console.error(json.data)
          }
        })
      } else {
        const spinner = log.spinner(log.withBranded('Installing those dependencies...')).start()
        spinners.push(spinner)
      }

      cp.on('exit', (code) => {
        if (!this.options.yarn) {
          if (code !== 0) spinners[spinners.length - 1].fail()
          else spinners[spinners.length - 1].succeed()
        }

        resolve()
      })
    })

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
