import {Command} from '../command'
import * as path from 'path'
import {Installer} from '@blitzjs/installer'
import _got from 'got'
import {log} from '@blitzjs/display'
import {dedent} from '../utils/dedent'
import {Stream} from 'stream'
import {promisify} from 'util'
import tar from 'tar'
import {mkdirSync, readFileSync, existsSync} from 'fs-extra'
import rimraf from 'rimraf'
import spawn from 'cross-spawn'
import * as os from 'os'

const pipeline = promisify(Stream.pipeline)

async function got(url: string) {
  return _got(url).catch((e) => Boolean(console.error(e)) || e)
}

async function gotJSON(url: string) {
  return JSON.parse((await got(url)).body)
}

async function isUrlValid(url: string) {
  return (await got(url).catch((e) => e)).statusCode === 200
}

function requireJSON(file: string) {
  return JSON.parse(readFileSync(file).toString('utf-8'))
}

const GH_ROOT = 'https://github.com/'
const API_ROOT = 'https://api.github.com/repos/'
const CODE_ROOT = 'https://codeload.github.com/'

export enum InstallerType {
  Local,
  Remote,
}

interface InstallerMeta {
  path: string
  subdirectory?: string
  type: InstallerType
}

export class Install extends Command {
  static description = 'Install a third-party package into your Blitz app'
  static aliases = ['i']
  static strict = false
  static hidden = true

  static args = [
    {
      name: 'installer',
      required: true,
      description: 'Name of a Blitz installer from @blitzjs/installers, or a file path to a local installer',
    },
    {
      name: 'installer-flags',
      description:
        'A list of flags to pass to the installer. Blitz will only parse these in the form key=value',
    },
  ]

  // exposed for testing
  normalizeInstallerPath(installerArg: string): InstallerMeta {
    const isNavtiveInstaller = /^([\w\-_]*)$/.test(installerArg)
    const isUrlInstaller = installerArg.startsWith(GH_ROOT)
    const isGitHubShorthandInstaller = /^([\w-_]*)\/([\w-_]*)$/.test(installerArg)
    if (isNavtiveInstaller || isUrlInstaller || isGitHubShorthandInstaller) {
      let repoUrl
      let subdirectory
      switch (true) {
        case isUrlInstaller:
          repoUrl = installerArg
          break
        case isNavtiveInstaller:
          repoUrl = `${GH_ROOT}blitz-js/blitz`
          subdirectory = `installers/${installerArg}`
          break
        case isGitHubShorthandInstaller:
          repoUrl = `${GH_ROOT}${installerArg}`
          break
        default:
          throw new Error('should be impossible, the 3 cases are the only way to get into this switch')
      }
      return {
        path: repoUrl,
        subdirectory,
        type: InstallerType.Remote,
      }
    } else {
      return {
        path: installerArg,
        type: InstallerType.Local,
      }
    }
  }

  /**
   * Clones the repository into a temp directory, returning the path to the new directory
   *
   * Exposed for unit testing
   *
   * @param repoFullName username and repository name in the form {{user}}/{{repo}}
   * @param defaultBranch the name of the repository's default branch
   */
  async cloneRepo(repoFullName: string, defaultBranch: string, subdirectory?: string): Promise<string> {
    const installerDir = path.join(os.tmpdir(), `blitz-installer-${repoFullName.replace('/', '-')}`)
    // clean up from previous run in case of error
    rimraf.sync(installerDir)
    mkdirSync(installerDir)
    process.chdir(installerDir)

    const repoName = repoFullName.split('/')[1]
    // `tar` top-level filder is `${repoName}-${defaultBranch}`, and then we want to get our installer path
    // within that folder
    const extractPath = subdirectory ? [`${repoName}-${defaultBranch}/${subdirectory}`] : undefined
    const depth = subdirectory ? subdirectory.split('/').length + 1 : 1
    await pipeline(
      _got.stream(`${CODE_ROOT}${repoFullName}/tar.gz/${defaultBranch}`),
      tar.extract({strip: depth}, extractPath),
    )

    return installerDir
  }

  private async runInstallerAtPath(installerPath: string) {
    const installer = require(installerPath).default as Installer<any>
    const installerArgs = this.argv.slice(1).reduce(
      (acc, arg) => ({
        ...acc,
        [arg.split('=')[0].replace(/--/g, '')]: arg.split('=')[1]
          ? JSON.parse(`"${arg.split('=')[1]}"`)
          : true, // if no value is provided, assume it's a boolean flag
      }),
      {},
    )
    await installer.run(installerArgs)
  }

  async run() {
    const {args} = this.parse(Install)
    const pkgManager = existsSync(path.resolve('yarn.lock')) ? 'yarn' : 'npm'
    const originalCwd = process.cwd()
    const installerInfo = this.normalizeInstallerPath(args.installer)

    if (installerInfo.type === InstallerType.Remote) {
      const apiUrl = installerInfo.path.replace(GH_ROOT, API_ROOT)
      const packageJsonPath = `${apiUrl}/contents/package.json`

      if (!(await isUrlValid(packageJsonPath))) {
        log.error(dedent`[blitz install] Installer path "${args.installer}" isn't valid. Please provide:
          1. The name of a dependency to install (e.g. "tailwind"),
          2. The full name of a GitHub repository (e.g. "blitz-js/example-installer"),
          3. A full URL to a Github repository (e.g. "https://github.com/blitz-js/example-installer"), or
          4. A file path to a locally-written installer.`)
      } else {
        const repoInfo = await gotJSON(apiUrl)

        let spinner = log.spinner(`Cloning GitHub repository for ${args.installer}`).start()
        const installerRepoPath = await this.cloneRepo(
          repoInfo.full_name,
          repoInfo.default_branch,
          installerInfo.subdirectory,
        )
        spinner.stop()

        spinner = log.spinner('Installing package.json dependencies').start()
        await new Promise((resolve) => {
          const installProcess = spawn(pkgManager, ['install'])
          installProcess.on('exit', resolve)
        })
        spinner.stop()

        const installerPackageMain = requireJSON('./package.json').main
        const installerEntry = path.resolve(installerPackageMain)
        process.chdir(originalCwd)

        await this.runInstallerAtPath(installerEntry)

        rimraf.sync(installerRepoPath)
      }
    } else {
      await this.runInstallerAtPath(path.resolve(args.installer))
    }
  }
}
