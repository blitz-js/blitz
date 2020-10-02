import * as path from "path"
import resolveFrom from "resolve-from"
import pkgDir from "pkg-dir"
import chalk from "chalk"
import {parseSemver} from "../utils/parse-semver"

async function main() {
  const options = require("minimist")(process.argv.slice(2))

  if (options._[0] !== "autocomplete:script" || Object.keys(options).length > 1) {
    console.log(
      chalk.yellow(
        `You are using alpha software - if you have any problems, please open an issue here:
      https://github.com/blitz-js/blitz/issues/new/choose\n`,
      ),
    )
  }

  if (parseSemver(process.version).major < 12) {
    console.log(
      chalk.yellow(
        `You are using an unsupported version of Node.js. Please switch to v12 or newer.\n`,
      ),
    )
    process.exit(1)
  }

  const globalBlitzPath = resolveFrom(__dirname, "blitz")
  const localBlitzPath = resolveFrom.silent(process.cwd(), "blitz")

  const isInDevelopmentAsGloballyLinked = __dirname.includes("packages/blitz/dist")

  let blitzPkgPath
  if (isInDevelopmentAsGloballyLinked) {
    blitzPkgPath = globalBlitzPath
  } else {
    // localBlitzPath won't exist if used outside a blitz app directory
    blitzPkgPath = localBlitzPath || globalBlitzPath
  }

  const cliPkgPath = resolveFrom(blitzPkgPath, "@blitzjs/cli")

  const cli = require(cliPkgPath)

  const hasVersionFlag = options._.length === 0 && (options.v || options.version)
  const hasVerboseFlag = options._.length === 0 && (options.V || options.verbose)

  if (hasVersionFlag) {
    if (hasVerboseFlag) {
      console.log("debug: blitzPkgPath:", blitzPkgPath)
      console.log("debug: cliPkgPath:", cliPkgPath, "\n")
    }
    try {
      const osName = require("os-name")
      console.log(`${osName()} | ${process.platform}-${process.arch} | Node: ${process.version}\n`)

      const globalBlitzPkgJsonPath = pkgDir.sync(globalBlitzPath) as string
      const localBlitzPkgJsonPath = pkgDir.sync(localBlitzPath)

      if (globalBlitzPkgJsonPath !== localBlitzPkgJsonPath) {
        // This branch won't run if user does `npx blitz` or `yarn blitz`
        const globalVersion = require(path.join(globalBlitzPkgJsonPath, "package.json")).version
        console.log(`blitz: ${globalVersion} (global)`)
      }

      if (localBlitzPkgJsonPath) {
        const localVersion = require(path.join(localBlitzPkgJsonPath, "package.json")).version
        console.log(`blitz: ${localVersion} (local)`)
      }

      await printEnvInfo()

      console.log("") // One last new line
    } catch (e) {
      throw new Error(`Blitz Error: ${e}`)
    }
    process.exit(0)
  } else {
    cli.run()
  }
}

/**
 * Prints detailed system info
 */
async function printEnvInfo() {
  const hasYarn = require("has-yarn")
  const envinfo = require("envinfo")

  const packageManager = `\n  Package manager: ${hasYarn() ? "yarn" : "npm"}`

  const env = await envinfo.run(
    {
      System: ["OS", "CPU", "Memory", "Shell"],
      Binaries: ["Node", "Yarn", "npm", "Watchman"],
      npmPackages: ["blitz", "typescript", "react", "react-dom", "@prisma/cli", "@prisma/client"],
    },
    {showNotFound: true},
  )

  console.log(packageManager, env)
}

main().catch((e) => {
  console.error(e)
})
