// import * as fs from "fs"
import * as path from "path"
// const resolveGlobal = require("resolve-global")
const resolveFrom = require("resolve-from")
const pkgDir = require("pkg-dir")
const chalk = require("chalk")

console.log(
  chalk.yellow(
    `You are using alpha software - if you have any problems, please open an issue here:
  https://github.com/blitz-js/blitz/issues/new/choose\n`,
  ),
)

console.log("__dirname", __dirname)
// console.log("A:", require.resolve("@blitzjs/cli"))
// console.log("B:", resolveFrom.silent(__dirname, "@blitzjs/cli"))
// console.log("--")
// console.log("b1:", resolveFrom.silent(process.cwd(), "blitz"))
// console.log("b2:", resolveFrom(resolveFrom(process.cwd(), "blitz"), "@blitzjs/cli"))
// console.log("--")
// console.log("Z:", resolveFrom.silent(process.cwd(), "@blitzjs/cli"))

// const localCLIPkgPath1 = path.resolve(process.cwd(), "node_modules", "@blitzjs/cli")
// const localCLIPkgPath2 = path.resolve(process.cwd(), "node_modules/blitz/node_modules/@blitzjs/cli")
// const monorepoCLIPkgPath = path.resolve(process.cwd(), "../..", "node_modules", "@blitzjs/cli")
// // TODO - shouldn't this be resolveFrom.silent?
// const globalCLIPkgPath = resolveFrom(__dirname, "@blitzjs/cli")
// const globalLinkedPath = path.resolve(pkgDir.sync(__dirname), "../../lerna.json")

// const isGlobalLinked = __dirname.includes("packages/blitz/dist")

let pkgPath: string = resolveFrom(
  resolveFrom.silent(process.cwd(), "blitz") || resolveFrom(__dirname, "blitz"),
  "@blitzjs/cli",
)

const cli = require(pkgPath)

const options = require("minimist")(process.argv.slice(2))
const hasVersionFlag = options._.length === 0 && (options.v || options.version)
const hasVerboseFlag = options._.length === 0 && (options.V || options.verbose)

if (hasVersionFlag) {
  if (hasVerboseFlag) {
    // console.log("debug:", usageType)
    console.log("debug: pkgPath:", pkgPath, "\n")
  }
  try {
    const osName = require("os-name")
    console.log(`${osName()} | ${process.platform}-${process.arch} | Node: ${process.version}\n`)

    const globalBlitzPath = pkgDir.sync(resolveFrom.silent(__dirname, "blitz"))
    console.log("globalBlitzPath", globalBlitzPath)
    const localBlitzPath = pkgDir.sync(resolveFrom.silent(process.cwd(), "blitz"))
    console.log("localBlitzPath", localBlitzPath)

    if (globalBlitzPath !== localBlitzPath) {
      // This will always happen if using the global CLI.
      // It won't happen if user does `npx blitz` or `yarn blitz`
      const globalPkgJson = path.join(globalBlitzPath, "package.json")
      console.log(`blitz: ${require(globalPkgJson).version} (global)`)
    }

    if (localBlitzPath) {
      const localVersion = require(path.join(localBlitzPath, "package.json")).version
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
