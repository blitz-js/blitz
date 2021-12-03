import type {RecipeCLIArgs, RecipeCLIFlags, RecipeExecutor} from "@blitzjs/installer"
import {flags} from "@oclif/command"
import {bootstrap} from "global-agent"
import {baseLogger, log} from "next/dist/server/lib/logging"
import {join, resolve} from "path"
import {Stream} from "stream"
import {promisify} from "util"
import {Command} from "../command"
const debug = require("debug")("blitz:cli")

declare global {
  namespace NodeJS {
    interface Global {
      GLOBAL_AGENT: {
        HTTP_PROXY?: string
        HTTPS_PROXY?: string
        NO_PROXY?: string
      }
    }
  }
}

const pipeline = promisify(Stream.pipeline)

async function got(url: string) {
  return require("got")(url).catch((e: any) => {
    if (e.response.statusCode === 403) {
      baseLogger({displayDateTime: false}).error(e.response.body)
    } else {
      return e
    }
  })
}

async function gotJSON(url: string) {
  debug("[gotJSON] Downloading json from ", url)
  const res = await got(url)
  return JSON.parse(res.body)
}

async function isUrlValid(url: string) {
  return (await got(url).catch((e) => e)).statusCode === 200
}

function requireJSON(file: string) {
  return JSON.parse(require("fs-extra").readFileSync(file).toString("utf-8"))
}

function checkLockFileExists(filename: string) {
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

export class Install extends Command {
  static description = "Install a Recipe into your Blitz app"
  static aliases = ["i"]
  static strict = false

  static flags = {
    help: flags.help({char: "h"}),
    yes: flags.boolean({
      char: "y",
      default: false,
      description: "Install the recipe automatically without user confirmation",
    }),
    env: flags.string({
      char: "e",
      description: "Set app environment name",
    }),
  }

  static args = [
    {
      name: "recipe",
      required: false,
      description:
        "Name of a Blitz recipe from @blitzjs/blitz/recipes, or a file path to a local recipe definition",
    },
    {
      name: "recipe-flags",
      description:
        "A list of flags to pass to the recipe. Blitz will only parse these in the form `key=value`",
    },
  ]

  // exposed for testing
  normalizeRecipePath(recipeArg: string): RecipeMeta {
    const isNavtiveRecipe = /^([\w\-_]*)$/.test(recipeArg)
    const isUrlRecipe = recipeArg.startsWith(GH_ROOT)
    const isGitHubShorthandRecipe = /^([\w-_]*)\/([\w-_]*)$/.test(recipeArg)
    if (isNavtiveRecipe || isUrlRecipe || isGitHubShorthandRecipe) {
      let repoUrl
      let subdirectory
      switch (true) {
        case isUrlRecipe:
          repoUrl = recipeArg
          break
        case isNavtiveRecipe:
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

  async getOfficialRecipeList(): Promise<string[]> {
    return await gotJSON(`${API_ROOT}blitz-js/blitz/git/trees/canary?recursive=1`).then(
      (release: GithubRepoAPITrees) =>
        release.tree.reduce((recipesList: string[], item) => {
          const filePath = item.path.split("/")
          const [directory, recipeName] = filePath
          if (directory === "recipes" && filePath.length === 2 && item.type === "tree") {
            recipesList.push(recipeName)
          }
          return recipesList
        }, []),
    )
  }

  async showRecipesPrompt(recipesList: string[]): Promise<string> {
    debug("recipesList", recipesList)
    const {recipeName} = (await this.enquirer.prompt({
      type: "select",
      name: "recipeName",
      message: "Select a recipe to install",
      choices: recipesList,
    })) as {recipeName: string}

    return recipeName
  }

  /**
   * Clones the repository into a temp directory, returning the path to the new directory
   *
   * Exposed for unit testing
   *
   * @param repoFullName username and repository name in the form {{user}}/{{repo}}
   * @param defaultBranch the name of the repository's default branch
   */
  async cloneRepo(
    repoFullName: string,
    defaultBranch: string,
    subdirectory?: string,
  ): Promise<string> {
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

  private async installRecipeAtPath(
    recipePath: string,
    ...runArgs: Parameters<RecipeExecutor<any>["run"]>
  ) {
    const recipe = require(recipePath).default as RecipeExecutor<any>

    await recipe.run(...runArgs)
  }

  /**
   * Setup proxy support for blitz install
   *
   * Loads proxy variables from enviroment and blitz.config.js
   *
   */
  private async setupProxySupport() {
    const {loadConfigProduction} = await import("next/dist/server/config-shared")
    const blitzConfig = loadConfigProduction(process.cwd())
    const cli = blitzConfig.cli
    const httpProxy = cli?.httpProxy || process.env.http_proxy || process.env.HTTP_PROXY
    const httpsProxy = cli?.httpsProxy || process.env.https_proxy || process.env.HTTPS_PROXY
    const noProxy = cli?.noProxy || process.env.no_proxy || process.env.NO_PROXY

    if (httpProxy || httpsProxy) {
      global.GLOBAL_AGENT = {
        HTTP_PROXY: httpProxy,
        HTTPS_PROXY: httpsProxy,
        NO_PROXY: noProxy,
      }

      bootstrap()
    }
  }

  async run() {
    this.parse(Install)

    require("../utils/setup-ts-node").setupTsnode()

    await this.setupProxySupport()

    const {args, flags, argv} = this.parse(Install)

    let selectedRecipe = args.recipe
    if (!selectedRecipe) {
      const officialRecipeList = await this.getOfficialRecipeList()
      selectedRecipe = await this.showRecipesPrompt(officialRecipeList)
    }
    const recipeInfo = this.normalizeRecipePath(selectedRecipe)

    const originalCwd = process.cwd()

    // Take all the args after the recipe string
    //
    // ['material-ui', '--yes', 'prop=true']
    // --> ['material-ui', 'prop=true']
    // --> ['prop=true']
    // --> { prop: 'true' }
    const cliArgs = argv
      .filter((arg) => !arg.startsWith("--"))
      .slice(1)
      .reduce<RecipeCLIArgs>(
        (acc, arg) => ({
          ...acc,
          [arg.split("=")[0]]: arg.split("=")[1] ? JSON.parse(`"${arg.split("=")[1]}"`) : true, // if no value is provided, assume it's a boolean flag
        }),
        {},
      )

    const cliFlags: RecipeCLIFlags = {
      yesToAll: flags.yes || false,
    }

    debug("recipeInfo", recipeInfo)
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
        baseLogger({displayDateTime: false}).error(`Could not find recipe "${args.recipe}"\n`)
        console.log(`${chalk.bold("Please provide one of the following:")}

1. The name of a recipe to install (e.g. "tailwind")
   ${chalk.dim(
     "- Available recipes listed at https://github.com/blitz-js/blitz/tree/canary/recipes",
   )}
2. The full name of a GitHub repository (e.g. "blitz-js/example-recipe"),
3. A full URL to a Github repository (e.g. "https://github.com/blitz-js/example-recipe"), or
4. A file path to a locally-written recipe.\n`)
        process.exit(1)
      } else {
        let spinner = log.spinner(`Cloning GitHub repository for ${selectedRecipe} recipe`).start()

        const recipeRepoPath = await this.cloneRepo(
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
        process.chdir(originalCwd)

        await this.installRecipeAtPath(recipeEntry, cliArgs, cliFlags)

        require("rimraf").sync(recipeRepoPath)
      }
    } else {
      await this.installRecipeAtPath(resolve(args.recipe), cliArgs, cliFlags)
    }
  }
}
