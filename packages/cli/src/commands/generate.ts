import {Command} from "../command"
import {flags} from "@oclif/command"
import {log} from "@blitzjs/display"
import {
  PageGenerator,
  PagesGenerator,
  MutationGenerator,
  MutationsGenerator,
  QueriesGenerator,
  FormGenerator,
  ModelGenerator,
  QueryGenerator,
} from "@blitzjs/generator"
import {PromptAbortedError} from "../errors/prompt-aborted"

const debug = require("debug")("blitz:generate")
const pascalCase = (str: string) => require("camelcase")(str, {pascalCase: true})
const getIsTypescript = () =>
  require("fs").existsSync(
    require("path").join(require("../utils/get-project-root").projectRoot, "tsconfig.json"),
  )

enum ResourceType {
  All = "all",
  Crud = "crud",
  Model = "model",
  Mutation = "mutation",
  Mutations = "mutations",
  Page = "page",
  Pages = "pages",
  Queries = "queries",
  Query = "query",
  Resource = "resource",
}

interface Flags {
  context?: string
  "dry-run"?: boolean
  parent?: string
}

interface Args {
  type: ResourceType
  model: string
}

function pluralize(input: string): string {
  return require("pluralize").isPlural(input) ? input : require("pluralize").plural(input)
}

function singular(input: string): string {
  return require("pluralize").isSingular(input) ? input : require("pluralize").singular(input)
}

function modelName(input: string = "") {
  return require("camelcase")(singular(input))
}
function modelNames(input: string = "") {
  return require("camelcase")(pluralize(input))
}
function ModelName(input: string = "") {
  return pascalCase(singular(input))
}
function ModelNames(input: string = "") {
  return pascalCase(pluralize(input))
}

const generatorMap = {
  [ResourceType.All]: [
    ModelGenerator,
    PagesGenerator,
    FormGenerator,
    QueriesGenerator,
    MutationGenerator,
  ],
  [ResourceType.Crud]: [MutationGenerator, QueriesGenerator],
  [ResourceType.Model]: [ModelGenerator],
  [ResourceType.Mutation]: [MutationGenerator],
  [ResourceType.Mutations]: [MutationsGenerator],
  [ResourceType.Page]: [PageGenerator],
  [ResourceType.Pages]: [PagesGenerator, FormGenerator],
  [ResourceType.Queries]: [QueriesGenerator],
  [ResourceType.Query]: [QueryGenerator],
  [ResourceType.Resource]: [ModelGenerator, QueriesGenerator, MutationGenerator],
}

export class Generate extends Command {
  static description = "Generate new files for your Blitz project"
  static aliases = ["g"]
  static strict = false
  static args = [
    {
      name: "type",
      required: true,
      description: "What files to generate",
      options: Object.keys(generatorMap).map((s) => s.toLowerCase()),
    },
    {
      name: "model",
      required: true,
      description: 'The name of your model, like "user". Can be singular or plural - same result',
    },
  ]

  static flags = {
    help: flags.help({char: "h"}),
    context: flags.string({
      char: "c",
      description:
        "Provide a context folder within which we'll place the generated files for better code organization. You can also supply this in the name of the model to be generated (e.g. `blitz generate query admin/projects`). Combining the `--context` flags and supplying context via the model name in the same command is not supported.",
    }),
    parent: flags.string({
      char: "p",
      description:
        "Specify a parent model to be used for generating nested routes for dependent data when generating pages, or to create hierarchical validation in queries and mutations. The code will be generated with the nested data model in mind. Most often this should be used in conjunction with 'blitz generate all'",
    }),
    "dry-run": flags.boolean({
      char: "d",
      description: "Show what files will be created without writing them to disk",
    }),
  }

  static examples = [
    `# The 'crud' type will generate all queries & mutations for a model
> blitz generate crud productVariant
    `,
    `# The 'all' generator will scaffold out everything possible for a model
> blitz generate all products
    `,
    `# The '--context' flag will allow you to generate files in a nested folder
> blitz generate pages projects --admin
    `,
    `# Context can also be supplied in the model name directly
> blitz generate pages admin/projects
    `,
    `# To generate nested routes for dependent models (e.g. Projects that contain
# Tasks), specify a parent model. For example, this command generates pages under
# app/tasks/pages/projects/[projectId]/tasks/
> blitz generate all tasks --parent=projects
    `,
    `# Database models can also be generated directly from the CLI
# Model fields can be specified with any generator that generates
# a database model ("all", "model", "resource"). Both of the below
# will generate the proper database model for a Task.
> blitz generate model task \\
    name:string \\
    completed:boolean:default[false] \\
    belongsTo:project?
> blitz generate all tasks \\
    name:string \\
    completed:boolean:default[false] \\
    belongsTo:project?
    `,
    `# Sometimes you want just a single file with no generated
# logic. Generating a singular type (e.g. "query" instead of "queries")
# will give you a more customizable template.
> blitz generate query getUserSession
> blitz generate page AdminHomePage`,
  ]

  async promptForTargetDirectory(paths: string[]): Promise<string> {
    return require("enquirer")
      .prompt({
        name: "directory",
        type: "select",
        message: "Please select a target directory:",
        choices: paths,
      })
      .then((resp: any) => resp.directory)
  }

  async genericConfirmPrompt(message: string): Promise<boolean> {
    return require("enquirer")
      .prompt({
        name: "continue",
        type: "select",
        message: message,
        choices: ["Yes", "No"],
      })
      .then((resp: any) => resp.continue === "Yes")
  }

  async handleNoContext(message: string): Promise<void> {
    const shouldCreateNewRoot = await this.genericConfirmPrompt(message)
    if (!shouldCreateNewRoot) {
      require("@blitzjs/display").log.error(
        "Could not determine proper location for files. Aborting.",
      )
      this.exit(0)
    }
  }

  getModelNameAndContext(modelName: string, context?: string): {model: string; context?: string} {
    const modelSegments = modelName.split(/[\\/]/)

    if (modelSegments.length > 1) {
      return {
        model: modelSegments[modelSegments.length - 1],
        context: require("path").join(...modelSegments.slice(0, modelSegments.length - 1)),
      }
    }

    if (Boolean(context)) {
      const contextSegments = (context as string).split(/[\\/]/)

      return {
        model: modelName,
        context: require("path").join(...contextSegments),
      }
    }

    return {
      model: modelName,
    }
  }

  async run() {
    const {args, argv, flags}: {args: Args; argv: string[]; flags: Flags} = this.parse(Generate)
    debug("args: ", args)
    debug("flags: ", flags)

    try {
      const {model, context} = this.getModelNameAndContext(args.model, flags.context)
      const singularRootContext = modelName(model)

      const generators = generatorMap[args.type]
      for (const GeneratorClass of generators) {
        const generator = new GeneratorClass({
          destinationRoot: require("path").resolve(),
          extraArgs: argv.slice(2).filter((arg) => !arg.startsWith("-")),
          modelName: singularRootContext,
          modelNames: modelNames(singularRootContext),
          ModelName: ModelName(singularRootContext),
          ModelNames: ModelNames(singularRootContext),
          parentModel: modelName(flags.parent),
          parentModels: modelNames(flags.parent),
          ParentModel: ModelName(flags.parent),
          ParentModels: ModelNames(flags.parent),
          rawInput: model,
          dryRun: flags["dry-run"],
          context: context,
          useTs: getIsTypescript(),
        })
        await generator.run()
      }

      console.log(" ") // new line
    } catch (err) {
      if (err instanceof PromptAbortedError) this.exit(0)

      log.error(err)
      this.exit(1)
    }
  }
}
