import {Command} from "../command"
import * as path from "path"
import {RecipeExecutor} from "@blitzjs/installer"
import _got from "got"
import {log} from "@blitzjs/display"
import {dedent} from "../utils/dedent"
import {Stream} from "stream"
import {promisify} from "util"
import tar from "tar"
import {mkdirSync, readFileSync, existsSync} from "fs-extra"
import rimraf from "rimraf"
import spawn from "cross-spawn"
import * as os from "os"
import {setupTsnode} from "../utils/setup-ts-node"

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
  return JSON.parse(readFileSync(file).toString("utf-8"))
}

const GH_ROOT = "https://github.com/"
const API_ROOT = "https://api.github.com/repos/"
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

export class Install extends Command {
  static description = "Install a third-party package into your Blitz app"
  static aliases = ["i"]
  static strict = false

  static args = [
    {
      name: "recipe",
      required: true,
      description:
        "Name of a Blitz recipe from @blitzjs/blitz/recipes, or a file path to a local recipe definition",
    },
    {
      name: "recipe-flags",
      description:
        "A list of flags to pass to the recipe. Blitz will only parse these in the form key=value",
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
    const recipeDir = path.join(os.tmpdir(), `blitz-recipe-${repoFullName.replace("/", "-")}`)
    // clean up from previous run in case of error
    rimraf.sync(recipeDir)
    mkdirSync(recipeDir)
    process.chdir(recipeDir)

    const repoName = repoFullName.split("/")[1]
    // `tar` top-level filter is `${repoName}-${defaultBranch}`, and then we want to get our recipe path
    // within that folder
    const extractPath = subdirectory ? [`${repoName}-${defaultBranch}/${subdirectory}`] : undefined
    const depth = subdirectory ? subdirectory.split("/").length + 1 : 1
    await pipeline(
      _got.stream(`${CODE_ROOT}${repoFullName}/tar.gz/${defaultBranch}`),
      tar.extract({strip: depth}, extractPath),
    )

    return recipeDir
  }

  private async installRecipeAtPath(recipePath: string) {
    const recipe = require(recipePath).default as RecipeExecutor<any>
    const recipeArgs = this.argv.slice(1).reduce(
      (acc, arg) => ({
        ...acc,
        [arg.split("=")[0].replace(/--/g, "")]: arg.split("=")[1]
          ? JSON.parse(`"${arg.split("=")[1]}"`)
          : true, // if no value is provided, assume it's a boolean flag
      }),
      {},
    )
    await recipe.run(recipeArgs)
  }

  async run() {
    setupTsnode()
    const {args} = this.parse(Install)
    const pkgManager = existsSync(path.resolve("yarn.lock")) ? "yarn" : "npm"
    const originalCwd = process.cwd()
    const recipeInfo = this.normalizeRecipePath(args.recipe)

    if (recipeInfo.location === RecipeLocation.Remote) {
      const apiUrl = recipeInfo.path.replace(GH_ROOT, API_ROOT)
      const packageJsonPath = `${apiUrl}/contents/package.json`

      if (!(await isUrlValid(packageJsonPath))) {
        log.error(dedent`[blitz install] Recipe path "${args.recipe}" isn't valid. Please provide:
          1. The name of a dependency to install (e.g. "tailwind"),
          2. The full name of a GitHub repository (e.g. "blitz-js/example-recipe"),
          3. A full URL to a Github repository (e.g. "https://github.com/blitz-js/example-recipe"), or
          4. A file path to a locally-written recipe.`)
      } else {
        const repoInfo = await gotJSON(apiUrl)

        let spinner = log.spinner(`Cloning GitHub repository for ${args.recipe}`).start()
        const recipeRepoPath = await this.cloneRepo(
          repoInfo.full_name,
          repoInfo.default_branch,
          recipeInfo.subdirectory,
        )
        spinner.stop()

        spinner = log.spinner("Installing package.json dependencies").start()
        await new Promise((resolve) => {
          const installProcess = spawn(pkgManager, ["install"])
          installProcess.on("exit", resolve)
        })
        spinner.stop()

        const recipePackageMain = requireJSON("./package.json").main
        const recipeEntry = path.resolve(recipePackageMain)
        process.chdir(originalCwd)

        await this.installRecipeAtPath(recipeEntry)

        rimraf.sync(recipeRepoPath)
      }
    } else {
      await this.installRecipeAtPath(path.resolve(args.recipe))
    }
  }
}
