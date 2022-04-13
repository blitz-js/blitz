import {
  capitalize,
  FormGenerator,
  ModelGenerator,
  MutationGenerator,
  MutationsGenerator,
  PageGenerator,
  pluralCamel,
  pluralPascal,
  QueriesGenerator,
  QueryGenerator,
  singleCamel,
  singlePascal,
  uncapitalize,
} from "@blitzjs/generator"
import arg from "arg"
import {CliCommand} from "../index"
import prompts from "prompts"
import chalk from "chalk"

const getIsTypeScript = async () =>
  require("fs").existsSync(require("path").join(process.cwd(), "tsconfig.json"))

enum ResourceType {
  All = "all",
  Crud = "crud",
  Model = "model",
  Pages = "pages",
  Queries = "queries",
  Query = "query",
  Mutations = "mutations",
  Mutation = "mutation",
  Resource = "resource",
}

function modelName(input: string = "") {
  return singleCamel(input)
}
function modelNames(input: string = "") {
  return pluralCamel(input)
}
function ModelName(input: string = "") {
  return singlePascal(input)
}
function ModelNames(input: string = "") {
  return pluralPascal(input)
}

const generatorMap = {
  [ResourceType.All]: [
    PageGenerator,
    FormGenerator,
    QueriesGenerator,
    MutationsGenerator,
    ModelGenerator,
  ],
  [ResourceType.Crud]: [MutationsGenerator, QueriesGenerator],
  [ResourceType.Model]: [ModelGenerator],
  [ResourceType.Pages]: [PageGenerator, FormGenerator],
  [ResourceType.Queries]: [QueriesGenerator],
  [ResourceType.Query]: [QueryGenerator],
  [ResourceType.Mutations]: [MutationsGenerator],
  [ResourceType.Mutation]: [MutationGenerator],
  [ResourceType.Resource]: [QueriesGenerator, MutationsGenerator, ModelGenerator],
}

const args = arg(
  {
    // Types
    "--help": Boolean,
    "--type": String,
    "--name": String,
    "--context": String,
    "--parent": String,
    "--dry-run": Boolean,
    "--env": String,
  },
  {
    permissive: true,
  },
)

let selectedType: string | keyof typeof generatorMap
let selectedModelName: string | undefined
let selectedContext: string | undefined
let selectedParent: string | undefined = args["--parent"] ?? undefined

const getModelNameAndContext = (
  modelName: string,
  context?: string,
): {model: string; context?: string} => {
  const modelSegments = modelName.split(/[\\/]/)

  if (modelSegments.length > 1) {
    return {
      model: modelSegments[modelSegments.length - 1] as string,
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

const validateModelName = (modelName: string): void => {
  const RESERVED_MODEL_NAMES = ["page", "api", "query", "mutation"]
  if (RESERVED_MODEL_NAMES.includes(modelName)) {
    throw new Error(`Names ${RESERVED_MODEL_NAMES} or their plurals cannot be used as model names`)
  }
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(modelName)) {
    throw new Error(
      `Invalid model name: "${modelName}". Model names need to adhere to this regular expression: [A-Za-z][A-Za-z0-9_]*`,
    )
  }
}

const determineType = async () => {
  if (
    !args["--type"] ||
    (args["--type"] && !Object.keys(generatorMap).includes(args["--type"].toLowerCase()))
  ) {
    const res = await prompts({
      type: "select",
      name: "type",
      message: "Which files to generate",
      initial: 0,
      choices: Object.entries(generatorMap).map((c) => {
        return {title: c[0], value: c[0]}
      }),
    })

    selectedType = res.type
  } else {
    selectedType = args["--type"]
  }
}

const determineName = async () => {
  if (!args["--name"]) {
    const res = await prompts({
      type: "text",
      name: "model",
      message: `The name of your model, like "user". Can be singular or plural - same result`,
    })

    const {model, context} = getModelNameAndContext(res.model)
    selectedModelName = model
    selectedContext = context
  } else {
    const {model, context} = getModelNameAndContext(args["--name"])
    selectedModelName = model
    selectedContext = context
  }
}

const determineContext = async () => {
  if (args["--context"] && !selectedModelName) {
    if (args["--name"] && args["--name"].includes("/")) {
      throw new Error("Your model should not contain a context when supplying a context explicitly")
    }

    const res = await prompts({
      type: "text",
      name: "model",
      message: `The name of your model, like "user". Can be singular or plural - same result`,
    })

    if (res.model.includes("/")) {
      throw new Error("Your model should not contain a context when supplying a context explicitly")
    }
    const {model, context} = getModelNameAndContext(res.model, args["--context"])
    selectedModelName = model
    selectedContext = context
  }
}

const getHelp = async () => {
  if (args["--help"]) {
    console.log(`
      # The 'crud' type will generate all queries & mutations for a model
      
        > blitz generate --type crud --name productVariant

      # The 'all' generator will scaffold out everything possible for a model
      
        > blitz generate --type all --name products

      # The '--context' flag will allow you to generate files in a nested folder
      
        > blitz generate --type pages --name projects --context admin

      # Context can also be supplied in the model name directly
      
        > blitz generate --type pages --name admin/projects

      # To generate nested routes for dependent models (e.g. Projects that contain Tasks), specify a parent model. 
      For example, this command generates pages under app/tasks/pages/projects/[projectId]/tasks/
        
        > blitz generate --type all --name tasks --parent=projects

      # Database models can also be generated directly from the CLI.
        Model fields can be specified with any generator that generates a database model ("all", "model", "resource"). 
        Both of the commands below will generate the proper database model for a Task.
      
        > blitz generate --type model --name task name:string completed:boolean:default=false belongsTo:project?

        > blitz generate --type all --name tasks name:string completed:boolean:default=false belongsTo:project?

    `)

    process.exit(0)
  }
}

const generate: CliCommand = async (argv) => {
  await getHelp()
  await determineType()
  await determineContext()
  if (!selectedModelName) {
    await determineName()
  }

  try {
    const singularRootContext = modelName(selectedModelName)
    validateModelName(singularRootContext)

    // const {loadConfigProduction} = await import("next/dist/server/config-shared")
    // const blitzConfig = loadConfigProduction(process.cwd())
    const generators = generatorMap[selectedType as keyof typeof generatorMap]

    for (const GeneratorClass of generators) {
      const generator = new GeneratorClass({
        destinationRoot: require("path").resolve(),
        // templateDir: blitzConfig.codegen?.templateDir,
        extraArgs: args["_"].slice(1) as string[],
        modelName: singularRootContext,
        modelNames: modelNames(singularRootContext),
        ModelName: ModelName(singularRootContext),
        ModelNames: ModelNames(singularRootContext),
        parentModel: modelName(selectedParent),
        parentModels: modelNames(selectedParent),
        ParentModel: ModelName(selectedParent),
        ParentModels: ModelNames(selectedParent),
        name: uncapitalize(selectedModelName!),
        Name: capitalize(selectedModelName!),
        dryRun: args["--dry-run"],
        context: selectedContext,
        useTs: await getIsTypeScript(),
      })
      await generator.run()
    }
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

export {generate}
