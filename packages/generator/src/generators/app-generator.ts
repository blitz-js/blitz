import {Generator, GeneratorOptions} from '../generator'
import spawn from 'cross-spawn'
import chalk from 'chalk'
import username from 'username'
import {readJSONSync, writeJson} from 'fs-extra'
import {resolve, join} from 'path'
import {fetchLatestVersionsFor} from '../utils/fetch-latest-version-for'
import {log} from '@blitzjs/server'
import {getBlitzDependencyVersion} from '../utils/get-blitz-dependency-version'

export interface AppGeneratorOptions extends GeneratorOptions {
  appName: string
  useTs: boolean
  yarn: boolean
  version: string
  skipInstall: boolean
}

export class AppGenerator extends Generator<AppGeneratorOptions> {
  sourceRoot: string = resolve(__dirname, './templates/app')

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
    const spinner = log.spinner(log.withBrand('Retrieving the freshest of dependencies')).start()

    const [
      {value: newDependencies, isFallback: dependenciesUsedFallback},
      {value: newDevDependencies, isFallback: devDependenciesUsedFallback},
      {value: blitzDependencyVersion, isFallback: blitzUsedFallback},
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

    if (!fallbackUsed && !this.options.skipInstall) {
      spinner.succeed()

      await new Promise((resolve) => {
        const logFlag = this.options.yarn ? '--json' : '--loglevel=error'
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

        if (!this.options.yarn) {
          const spinner = log
            .spinner(log.withBrand('Installing those dependencies (this will take a few minutes)'))
            .start()
          spinners.push(spinner)
        }

        cp.stdout?.setEncoding('utf8')
        cp.stderr?.setEncoding('utf8')
        cp.stdout?.on('data', (data) => {
          if (this.options.yarn) {
            let json = getJSON(data)
            if (json && json.type === 'step') {
              spinners[spinners.length - 1]?.succeed()
              const spinner = log.spinner(log.withBrand(json.data.message)).start()
              spinners.push(spinner)
            }
            if (json && json.type === 'success') {
              spinners[spinners.length - 1]?.succeed()
            }
          }
        })
        cp.stderr?.on('data', (data) => {
          if (this.options.yarn) {
            let json = getJSON(data)
            if (json && json.type === 'error') {
              spinners[spinners.length - 1]?.fail()
              console.error(json.data)
            }
          } else {
            // Hide the annoying Prisma warning about not finding the schema file
            // because we generate the client ourselves
            if (!data.includes('schema.prisma')) {
              console.error(`\n${data}`)
            }
          }
        })
        cp.on('exit', (code) => {
          if (!this.options.yarn && spinners[spinners.length - 1].isSpinning) {
            if (code !== 0) spinners[spinners.length - 1].fail()
            else {
              spinners[spinners.length - 1].succeed()
            }
          }
          resolve()
        })
      })

      const runLocalNodeCLI = (command: string) => {
        if (this.options.yarn) {
          return spawn.sync('yarn', ['run', ...command.split(' ')])
        } else {
          return spawn.sync('npx', command.split(' '))
        }
      }

      // Ensure the generated files are formatted with the installed prettier version
      const prettierResult = runLocalNodeCLI('prettier --loglevel silent --write .')
      if (prettierResult.status !== 0) {
        throw new Error('Failed running prettier')
      }
    } else {
      console.log('') // New line needed
      spinner.fail(
        chalk.red.bold(
          `We had some trouble connecting to the network, so we'll skip installing your dependencies right now. Make sure to run ${
            this.options.yarn ? "'yarn'" : "'npm install'"
          } once you're connected again.`,
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
