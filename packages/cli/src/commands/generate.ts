import Command from '../command'
import {flags} from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'
import enquirer from 'enquirer'
import _pluralize from 'pluralize'
import PageGenerator from '../generators/page'
import MutationGenerator from '../generators/mutation'
import PromptAbortedError from '../errors/prompt-aborted'
import QueryGenerator from '../generators/query'
import ModelGenerator from '../generators/model'
import {log} from '@blitzjs/server'
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
  context?: string
  'dry-run'?: boolean
}

interface Args {
  type: ResourceType
  name: string
}

function pluralize(input: string): string {
  return (_pluralize.isPlural(input) ? input : _pluralize.plural(input)).toLocaleLowerCase()
}

function singular(input: string): string {
  return (_pluralize.isSingular(input) ? input : _pluralize.singular(input)).toLocaleLowerCase()
}

function capitalize(input: string): string {
  return `${input.slice(0, 1).toLocaleUpperCase()}${input.slice(1)}`
}

const generatorMap = {
  [ResourceType.All]: [ModelGenerator, PageGenerator, QueryGenerator, MutationGenerator],
  [ResourceType.Crud]: [MutationGenerator, QueryGenerator],
  [ResourceType.Mutation]: [MutationGenerator],
  [ResourceType.Page]: [PageGenerator],
  [ResourceType.Query]: [QueryGenerator],
  [ResourceType.Resource]: [ModelGenerator, QueryGenerator, MutationGenerator],
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
        ResourceType.Resource,
        ResourceType.Crud,
        ResourceType.Query,
        ResourceType.Mutation,
        ResourceType.Page,
      ],
    },
    {
      name: 'name',
      required: true,
      description: 'Namespace for generated files (e.g. [name]Query.ts).',
    },
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    context: flags.string({
      char: 'c',
      description:
        'The parent folder for nested generation. For example, generating `products` within a `store` would supply `-c store`. For nested contexts you may supply the full path.',
    }),
    'dry-run': flags.boolean({
      char: 'd',
      description: 'Show what files will be created without writing them to disk',
    }),
  }

  static examples = [
    `# We can just generate a single file type, for example queries. In this case,
# the generator will ask any questions necessary to generate the proper files.
blitz generate query task
    `,
    `# Or, we can generate a full set of models, mutations, pages, etc.
blitz generate all task
    `,
    `# We can specify where the files belong with the context flag, this allows you
# to generate nested routes automatically. The example below would generate a route
# for https://myapp.com/taskManager/task.
blitz generate page task -c=taskManager`,
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
      log.error('Could not determine proper location for files. Aborting.')
      this.exit(0)
    }
  }

  async run() {
    const {args, flags}: {args: Args; flags: Flags} = this.parse(Generate)
    debug('args: ', args)
    debug('flags: ', flags)

    const isInRoot = fs.existsSync(path.resolve('blitz.config.js'))

    if (!isInRoot) {
      log.error('No blitz.config.js found. `generate` must be run from the root of the project.')
      this.exit(1)
    }

    try {
      let fileRoot: string
      let singularRootContext: string
      let pluralRootContext: string
      let nestedContextPaths: string[] = []
      // otherwise, validate the provided path, prompting the user if it's absent or invalid
      if (!flags.context) {
        if (fs.existsSync(path.resolve('app', pluralize(args.name)))) {
          singularRootContext = singular(args.name)
          fileRoot = pluralRootContext = pluralize(args.name)
        } else {
          singularRootContext = singular(args.name)
          fileRoot = pluralRootContext = pluralize(args.name)
        }
      } else {
        // use [\\/] as the separator to match UNIX and Windows path formats
        const contextParts = flags.context.split(/[\\/]/)
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

      const generators = generatorMap[args.type]
      for (const GeneratorClass of generators) {
        const generator = new GeneratorClass({
          sourceRoot: path.join(__dirname, `../../templates/${GeneratorClass.template}`),
          destinationRoot: path.resolve(),
          name: capitalize(singularRootContext),
          pluralName: capitalize(pluralRootContext),
          dryRun: flags['dry-run'],
          // provide the file context as a relative path to the current directory (with a slash appended)
          // to generate files without changing the current directory. This allows yeoman to print out the
          // full file path rather than the current path
          fileContext:
            path.relative(
              path.resolve(),
              path.resolve('app', fileRoot, GeneratorClass.subdirectory, ...nestedContextPaths),
            ) + '/',
        })
        await generator.run()
      }
    } catch (err) {
      if (err instanceof PromptAbortedError) this.exit(0)

      log.error(err)
      this.exit(1)
    }
  }
}
