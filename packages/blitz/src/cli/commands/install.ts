import arg from "arg"
import {CliCommand} from "../index"
import prompts from "prompts"
import {bootstrap} from "global-agent"
import {baseLogger, log} from "../../logging"
const debug = require("debug")("blitz:cli")
import {join, resolve} from "path"
import {Stream} from "stream"
import {promisify} from "util"
import {RecipeCLIFlags, RecipeExecutor} from "../../installer"
import {setupTsnode} from "../utils/setup-ts-node"

interface GlobalAgent {
  HTTP_PROXY?: string
  HTTPS_PROXY?: string
  NO_PROXY?: string
}

declare global {
  var GLOBAL_AGENT: GlobalAgent
}

const args = arg(
  {
    // Types
    "--help": Boolean,
    "--env": String,
    "--yes": Boolean,

    // Aliases
    "-e": "--env",
    "-y": "--yes",
  },
  {
    permissive: true,
  },
)

const pipeline = promisify(Stream.pipeline)

const got = async (url: string) => {
  return require("got")(url).catch((e: any) => {
    if (e.response.statusCode === 403) {
      baseLogger({displayDateTime: false}).error(e.response.body)
    } else {
      return e
    }
  })
}

const gotJSON = async (url: string) => {
  debug("[gotJSON] Downloading json from ", url)
  const res = await got(url)
  return JSON.parse(res.body)
}

const isUrlValid = async (url: string) => {
  return (await got(url).catch((e) => e)).statusCode === 200
}

const requireJSON = (file: string) => {
  return JSON.parse(require("fs-extra").readFileSync(file).toString("utf-8"))
}

const checkLockFileExists = (filename: string) => {
  return require("fs-extra").existsSync(resolve(filename))
}

const GH_ROOT = "https://github.com/"
const API_ROOT = "https://api.github.com/repos/"
const RAW_ROOT = "https://raw.githubusercontent.com/"
const CODE_ROOT = "https://codeload.github.com/"

export enum RecipeLocation {
  Local,
  Remote,
}

interface RecipeMeta {
  path: string
  subdirectory?: string
  location: RecipeLocation
}

interface Tree {
  path: string
  mode: string
  type: string
  sha: string
  size: number
  url: string
}

interface GithubRepoAPITrees {
  sha: string
  url: string
  tree: Tree[]
  truncated: boolean
}

const getOfficialRecipeList = async (): Promise<string[]> => {
  return await gotJSON(`${API_ROOT}blitz-js/blitz/git/trees/main?recursive=1`).then(
    (release: GithubRepoAPITrees) =>
      release.tree.reduce((recipesList: string[], item) => {
        const filePath = item.path.split("/")
        const [directory, recipeName] = filePath
        if (
          directory === "recipes" &&
          filePath.length === 2 &&
          item.type === "tree" &&
          recipeName
        ) {
          recipesList.push(recipeName)
        }
        return recipesList
      }, []),
  )
}

const normalizeRecipePath = (recipeArg: string): RecipeMeta => {
  const isNativeRecipe = /^([\w\-_]*)$/.test(recipeArg)
  const isUrlRecipe = recipeArg.startsWith(GH_ROOT)
  const isGitHubShorthandRecipe = /^([\w-_]*)\/([\w-_]*)$/.test(recipeArg)
  if (isNativeRecipe || isUrlRecipe || isGitHubShorthandRecipe) {
    let repoUrl
    let subdirectory
    switch (true) {
      case isUrlRecipe:
        repoUrl = recipeArg
        break
      case isNativeRecipe:
        repoUrl = `${GH_ROOT}blitz-js/blitz`
        subdirectory = `recipes/${recipeArg}`
        break
      case isGitHubShorthandRecipe:
        repoUrl = `${GH_ROOT}${recipeArg}`
        break
      default:
        throw new Error(
          "should be impossible, the 3 cases are the only way to get into this switch",
        )
    }
    return {
      path: repoUrl,
      subdirectory,
      location: RecipeLocation.Remote,
    }
  } else {
    return {
      path: recipeArg,
      location: RecipeLocation.Local,
    }
  }
}

const cloneRepo = async (
  repoFullName: string,
  defaultBranch: string,
  subdirectory?: string,
): Promise<string> => {
  debug("[cloneRepo] starting...")
  const recipeDir = join(process.cwd(), ".blitz", "recipe-install")
  // clean up from previous run in case of error
  require("rimraf").sync(recipeDir)
  require("fs-extra").mkdirsSync(recipeDir)
  process.chdir(recipeDir)
  debug("Extracting recipe to ", recipeDir)

  const repoName = repoFullName.split("/")[1]
  // `tar` top-level filter is `${repoName}-${defaultBranch}`, and then we want to get our recipe path
  // within that folder
  const extractPath = subdirectory ? [`${repoName}-${defaultBranch}/${subdirectory}`] : undefined
  const depth = subdirectory ? subdirectory.split("/").length + 1 : 1
  await pipeline(
    require("got").stream(`${CODE_ROOT}${repoFullName}/tar.gz/${defaultBranch}`),
    require("tar").extract({strip: depth}, extractPath),
  )

  return recipeDir
}

const installRecipeAtPath = async (
  recipePath: string,
  ...runArgs: Parameters<RecipeExecutor<any>["run"]>
) => {
  const recipe = require(recipePath).default as RecipeExecutor<any>

  await recipe.run(...runArgs)
}

const setupProxySupport = async () => {
  const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY
  const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY
  const noProxy = process.env.no_proxy || process.env.NO_PROXY

  if (httpProxy || httpsProxy) {
    globalThis.GLOBAL_AGENT = {
      HTTP_PROXY: httpProxy,
      HTTPS_PROXY: httpsProxy,
      NO_PROXY: noProxy,
    }

    bootstrap()
  }
}

const install: CliCommand = async () => {
  setupTsnode()

  let selectedRecipe: string | null = args._[1] ? `${args._[1]}` : null
  await setupProxySupport()

  if (!selectedRecipe) {
    const officialRecipeList = await getOfficialRecipeList()
    const res = await prompts({
      type: "select",
      name: "recipeName",
      message: "Select a recipe to install",
      choices: officialRecipeList.map((r) => {
        return {title: r, value: r}
      }),
    })
    selectedRecipe = res.recipeName
  }

  if (selectedRecipe) {
    const recipeInfo = normalizeRecipePath(selectedRecipe)
    // Take all the args after the recipe string
    //
    // ['material-ui', '--yes', 'prop=true']
    // --> ['material-ui', 'prop=true']
    // --> ['prop=true']
    // --> { prop: 'true' }
    const cliArgs = args._.filter((arg) => !arg.startsWith("--"))
      .slice(2)
      .reduce(
        (acc, arg) => ({
          ...acc,
          [`${arg.split("=")[0]}`]: arg.split("=")[1] ? JSON.parse(`"${arg.split("=")[1]}"`) : true, // if no value is provided, assume it's a boolean flag
        }),
        {},
      )

    const cliFlags: RecipeCLIFlags = {
      yesToAll: args["--yes"] || false,
    }

    const chalk = (await import("chalk")).default
    if (recipeInfo.location === RecipeLocation.Remote) {
      const apiUrl = recipeInfo.path.replace(GH_ROOT, API_ROOT)
      const rawUrl = recipeInfo.path.replace(GH_ROOT, RAW_ROOT)
      const repoInfo = await gotJSON(apiUrl)
      const packageJsonPath = join(
        `${rawUrl}`,
        repoInfo.default_branch,
        recipeInfo.subdirectory ?? "",
        "package.json",
      )

      if (!(await isUrlValid(packageJsonPath))) {
        debug("Url is invalid for ", packageJsonPath)
        baseLogger({displayDateTime: false}).error(`Could not find recipe "${args._[1]}"\n`)
        console.log(`${chalk.bold("Please provide one of the following:")}

1. The name of a recipe to install (e.g. "tailwind")
${chalk.dim("- Available recipes listed at https://github.com/blitz-js/blitz/tree/main/recipes")}
2. The full name of a GitHub repository (e.g. "blitz-js/example-recipe"),
3. A full URL to a Github repository (e.g. "https://github.com/blitz-js/example-recipe"), or
4. A file path to a locally-written recipe.\n`)
        process.exit(1)
      } else {
        let spinner = log.spinner(`Cloning GitHub repository for ${selectedRecipe} recipe`).start()
        const recipeRepoPath = await cloneRepo(
          repoInfo.full_name,
          repoInfo.default_branch,
          recipeInfo.subdirectory,
        )
        spinner.stop()
        spinner = log.spinner("Installing package.json dependencies").start()

        let pkgManager = "npm"
        let installArgs = ["install", "--legacy-peer-deps", "--ignore-scripts"]

        if (checkLockFileExists("yarn.lock")) {
          pkgManager = "yarn"
          installArgs = ["install", "--ignore-scripts"]
        } else if (checkLockFileExists("pnpm-lock.yaml")) {
          pkgManager = "pnpm"
          installArgs = ["install", "--ignore-scripts"]
        }

        await new Promise((resolve) => {
          const installProcess = require("cross-spawn")(pkgManager, installArgs)
          installProcess.on("exit", resolve)
        })
        spinner.stop()

        const recipePackageMain = requireJSON("./package.json").main
        const recipeEntry = resolve(recipePackageMain)
        process.chdir(process.cwd())

        await installRecipeAtPath(recipeEntry, cliArgs, cliFlags)

        require("rimraf").sync(recipeRepoPath)
      }
    } else {
      try {
        await installRecipeAtPath(resolve(`${args._[1]}`), cliArgs, cliFlags)
      } catch (err) {
        if (err instanceof Error) {
          throw new Error(err.message)
        }
        console.log(err)
      }
    }
  }
}

export {install}
