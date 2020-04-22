import Command from '../command'
import {flags} from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import enquirer from 'enquirer'
const debug = require('debug')('blitz:generate')

enum ResourceType {
  Resource = 'resource',
  Model = 'model',
  Page = 'page',
  Mutation = 'mutation',
  Query = 'query',
}

interface Flags {
  path?: string
  'dry-run'?: boolean
}

interface Args {
  type: ResourceType
  name: string
}

export default class Generate extends Command {
  static description = 'Generate new files for your Blitz project'

  static args = [
    {
      name: 'type',
      required: true,
      description: 'Type of files to generate',
      options: [
        ResourceType.Model,
        ResourceType.Mutation,
        ResourceType.Page,
        ResourceType.Query,
        ResourceType.Resource,
      ],
    },
    {
      name: 'name',
      required: true,
      description: 'Namespace for generated files (e.g. [name]Query.ts)',
    },
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    path: flags.string({
      char: 'p',
      description: 'Path to app directory where files should be generated',
    }),
    'dry-run': flags.boolean({
      char: 'd',
      description: 'Show what files will be created without writing them to disk',
    }),
  }

  static examples = [
    `# We can just generate a single file type, for example a query:
blitz generate query task
    `,
    `# Or, we can generate a full set of models, mutations, pages, etc.
blitz generate resource task
    `,
    `# If we have multiple entries in /app, we must specify where the files belong
blitz generate resource task -p=taskManager`,
  ]

  async promptForTargetDirectory(paths: string[]): Promise<string> {
    return enquirer
      .prompt<{directory: string}>({
        name: 'directory',
        type: 'select',
        message: 'Please select a target directory:',
        choices: paths,
      })
      .then((resp) => resp.directory)
  }

  async genericConfirmPrompt(message: string): Promise<boolean> {
    return enquirer
      .prompt<{continue: string}>({
        name: 'continue',
        type: 'select',
        message: message,
        choices: ['Yes', 'No'],
      })
      .then((resp) => resp.continue === 'Yes')
  }

  async run() {
    const {args, flags}: {args: Args; flags: Flags} = this.parse(Generate)
    debug('args: ', args)
    debug('flags: ', flags)

    console.log(args, flags)

    const isInRoot = fs.existsSync(path.resolve('blitz.config.js'))

    if (!isInRoot) {
      this.error(chalk.red('No blitz.config.js found. `generate` must be run from the root of the project.'))
    }

    // we can only assume the output directory if /app has a single child directory,
    // otherwise we should prompt the user
    let appPaths = fs.readdirSync(path.resolve('app'))
    let outputTarget: string
    if (appPaths.length === 1) {
      // if there's only one path, we can ignore the path flag safely
      const appPath = appPaths[0]
      if (flags.path && flags.path !== appPath) {
        // if the path provided isn't the only path, warn the user
        this.log(
          chalk.yellow(
            `Warning: supplied path '${flags.path}' doesn't exist in this project. The only found path was '${appPath}.'`,
          ),
          {pad: true},
        )
        const shouldContinue = await this.genericConfirmPrompt(
          `Would you like to place files in '/app/${appPath}' instead?`,
        )
        if (!shouldContinue) {
          this.exit(0)
        }
      }
      outputTarget = appPaths[0]
    } else {
      // otherwise, validate the provided path, prompting the user if it's absent or invalid
      if (!flags.path) {
        this.log(
          chalk.yellow(
            `No path flag (--path, -p) was detected, but multiple roots under /app were present (${appPaths.join()})`,
          ),
        )
        outputTarget = await this.promptForTargetDirectory(appPaths)
      } else if (!appPaths.includes(flags.path)) {
        this.log(chalk.yellow(`Given path '${flags.path}' doesn't exist in /app. Please select a valid path`))
        outputTarget = await this.promptForTargetDirectory(appPaths)
      } else {
        outputTarget = flags.path
      }
    }
    this.logTheme(`Outputting files to ${outputTarget}`, {pad: true})
    this.logTheme('Generator completed successfully 🎉✅')
  }
}
