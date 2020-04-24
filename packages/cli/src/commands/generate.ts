import Command from '../command'
import {flags} from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import enquirer from 'enquirer'
import _pluralize from 'pluralize'
import PageGenerator from '../generators/page'
import Generator from '../generator'
import PromptAbortedError from '../errors/prompt-aborted'
const debug = require('debug')('blitz:generate')

enum ResourceType {
  All = 'all',
  Crud = 'crud',
  Mutation = 'mutation',
  Page = 'page',
  Query = 'query',
  Resource = 'resource',
}

interface Flags {
  parent?: string
  'dry-run'?: boolean
}

interface Args {
  type: ResourceType
  name: string
}

function pluralize(input: string): string {
  return _pluralize.isPlural(input) ? input : _pluralize.plural(input)
}

function singular(input: string): string {
  return _pluralize.isSingular(input) ? input : _pluralize.singular(input)
}

function capitalize(input: string): string {
  return `${input.slice(0, 1).toLocaleUpperCase()}${input.slice(1)}`
}

type GeneratorConfig<T extends Generator<any>> = {
  subdir: string
  generator: T
}

// @ts-ignore
const generators: {[key in ResourceType]: GeneratorConfig<any>} = {
  [ResourceType.Page]: {subdir: 'pages', generator: PageGenerator},
}

export default class Generate extends Command {
  static description = 'Generate new files for your Blitz project'

  static aliases = ['g']

  static args = [
    {
      name: 'type',
      required: true,
      description: 'Type of files to generate',
      options: [
        ResourceType.All,
        ResourceType.Crud,
        ResourceType.Mutation,
        ResourceType.Page,
        ResourceType.Query,
        ResourceType.Resource,
      ],
    },
    {
      name: 'name',
      required: true,
      description:
        'Namespace for generated files (e.g. [name]Query.ts). If this is a nested resource the context can be supplied as a path here (e.g. store/product). Windows path separators are supported.',
    },
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    parent: flags.string({
      char: 'p',
      description:
        'The parent context for nested generation. For example, generating `products` within a `store` would supply `-c store`. For nested contexts you may supply the full path.',
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
blitz generate all task
    `,
    `# We can specify where the files belong with the context flag. If no flag is provided Blitz
# will give you the option to create a new top-level context directory.
blitz generate resource task -c=taskManager`,
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

  async handleNoContext(message: string): Promise<void> {
    const shouldCreateNewRoot = await this.genericConfirmPrompt(message)
    if (!shouldCreateNewRoot) {
      this.log('Could not determine proper location for files. Aborting.')
      this.exit(0)
    }
  }

  async run() {
    const {args, flags}: {args: Args; flags: Flags} = this.parse(Generate)
    debug('args: ', args)
    debug('flags: ', flags)

    const isInRoot = fs.existsSync(path.resolve('blitz.config.js'))

    if (!isInRoot) {
      this.error(chalk.red('No blitz.config.js found. `generate` must be run from the root of the project.'))
    }

    try {
      let fileRoot: string
      let singularRootContext: string
      let pluralRootContext: string
      let nestedContextPaths: string[] = []
      // otherwise, validate the provided path, prompting the user if it's absent or invalid
      if (!flags.parent) {
        await this.handleNoContext(
          `No context flag (--context, -c) was found. Would you like to create a new context folder under /app for '${pluralize(
            args.name,
          )}'?`,
        )
        singularRootContext = singular(args.name)
        fileRoot = pluralRootContext = pluralize(args.name)
      } else {
        // use [\\/] as the separator to match UNIX and Windows path formats
        const contextParts = flags.parent.split(/[\\/]/)
        if (contextParts.length === 0) {
          await this.handleNoContext(
            `Couldn't determine context from context flag. Would you like to create a new context folder under /app for '${pluralize(
              args.name,
            )}'?`,
          )
          singularRootContext = singular(args.name)
          fileRoot = pluralRootContext = pluralize(args.name)
        } else {
          // @ts-ignore shift can technically return undefined, but we already know the array isn't empty
          // so we can bypass the check
          fileRoot = pluralize(contextParts.shift())
          singularRootContext = singular(args.name)
          pluralRootContext = pluralize(args.name)
          nestedContextPaths = [...contextParts, pluralize(args.name)]
        }
      }

      const generatorConfig = generators[args.type]
      const generator = new generatorConfig.generator({
        sourceRoot: path.join(__dirname, `../../templates/${args.type}`),
        destinationRoot: path.resolve('app', fileRoot, generatorConfig.subdir, ...nestedContextPaths),
        name: capitalize(singularRootContext),
        pluralName: capitalize(pluralRootContext),
        context: nestedContextPaths,
      })
      await generator.run()
    } catch (err) {
      if (err instanceof PromptAbortedError) this.exit(0)

      this.error(err)
    }
    this.logTheme('Generator completed successfully 🎉✅')
  }
}
