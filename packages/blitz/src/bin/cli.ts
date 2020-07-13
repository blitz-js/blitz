import * as path from "path"
import resolveFrom from "resolve-from"
import pkgDir from "pkg-dir"
import chalk from "chalk"

console.log(
  chalk.yellow(
    `You are using alpha software - if you have any problems, please open an issue here:
  https://github.com/blitz-js/blitz/issues/new/choose\n`,
  ),
)

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

const options = require("minimist")(process.argv.slice(2))
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

    console.log("") // One last new line
  } catch (e) {
    console.log("blitz error", e)
  }
  process.exit(0)
} else {
  cli.run()
}
