import {NON_STANDARD_NODE_ENV} from "./utils/constants"
import arg from "arg"
import packageJson from "../../package.json"
import {loadEnvConfig} from "../env-utils"
import {getCommandBin} from "./utils/config"
import spawn from "cross-spawn"
import {readdirSync} from "fs-extra"
import resolveFrom from "resolve-from"
import pkgDir from "pkg-dir"
import {join} from "path"

const commonArgs = {
  // Types
  "--version": Boolean,
  "--help": Boolean,
  "--inspect": Boolean,
  "--env": String,

  // Aliases
  "-v": "--version",
  "-h": "--help",
  "-e": "--env",
}
const args = arg(commonArgs, {
  permissive: true,
})

const defaultCommand = "dev"
export type CliCommand = (argv?: string[]) => void
const commands: {[command: string]: () => Promise<CliCommand>} = {
  dev: () => import("./commands/next/dev").then((i) => i.dev),
  build: () => import("./commands/next/build").then((i) => i.build),
  start: () => import("./commands/next/start").then((i) => i.start),
  new: () => import("./commands/new").then((i) => i.newApp),
  generate: () => import("./commands/generate").then((i) => i.generate),
  codegen: () => import("./commands/codegen").then((i) => i.codegen),
  db: () => import("./commands/db").then((i) => i.db),
}
const foundCommand = Boolean(commands[args._[0] as string])
const command = foundCommand ? (args._[0] as string) : defaultCommand
const forwardedArgs = foundCommand ? args._.slice(1) : args._

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

async function runCommandFromBin() {
  const command = args._[0] as string
  let commandBin: string | null = null
  try {
    commandBin = await getCommandBin(command)
  } catch (e: any) {
    console.error(`Error: ${e.message}`)
  }

  if (!commandBin) {
    process.exit(1)
  }

  const result = spawn.sync(commandBin, process.argv.slice(3), {stdio: "inherit"})
  process.exit(result.status || 0)
}

async function printEnvInfo() {
  const osName = await import("os-name")
  const envinfo = await import("envinfo")
  const pkgManager = readdirSync(process.cwd()).includes("pnpm-lock.yaml")
    ? "pnpm"
    : readdirSync(process.cwd()).includes("yarn-lock.yaml")
    ? "yarn"
    : "npm"

  const env = await envinfo.default.run(
    {
      System: ["OS", "CPU", "Memory", "Shell"],
      Binaries: ["Node", "Yarn", "npm", "pnpm"],
      npmPackages: [
        "blitz",
        "typescript",
        "react",
        "react-dom",
        "prisma",
        "@prisma/client",
        "next",
      ],
    },
    {showNotFound: true},
  )

  const globalBlitzPkgJsonPath = pkgDir.sync(globalBlitzPath) as string
  const localBlitzPkgJsonPath = pkgDir.sync(localBlitzPath)

  if (globalBlitzPkgJsonPath !== localBlitzPkgJsonPath) {
    // This branch won't run if user does `npx blitz` or `yarn blitz`
    const globalVersion = require(join(globalBlitzPkgJsonPath, "package.json")).version
    console.log(`Blitz version: ${globalVersion} (global)`)
  }

  if (localBlitzPkgJsonPath) {
    const localVersion = require(join(localBlitzPkgJsonPath, "package.json")).version
    console.log(`Blitz version: ${localVersion} (local)`)
  }

  console.log(
    `${osName.default()} | ${process.platform}-${process.arch} | Node: ${process.version}\n`,
  )
  console.log(`\n Package manager: ${pkgManager}`)
  console.log(env)
  process.exit(0)
}

async function main() {
  loadEnvConfig(process.cwd(), undefined, {error: console.error, info: console.info})

  // Version is inlined into the file using taskr build pipeline
  if (args["_"].length === 0 && args["--version"]) {
    await printEnvInfo()
  }

  if (args["--env"]) {
    process.env.APP_ENV = args["--env"]
  }

  if (args["--help"]) {
    forwardedArgs.push("--help")
  }

  // env variable should default to dev unless the command is build or start
  const defaultEnv = command === "build" || command === "start" ? "production" : "development"

  const standardEnv = ["production", "development", "test"]
  if (process.env.NODE_ENV && !standardEnv.includes(process.env.NODE_ENV)) {
    console.warn(NON_STANDARD_NODE_ENV)
  }
  ;(process.env as any).NODE_ENV = process.env.NODE_ENV || defaultEnv

  // Make sure commands gracefully respect termination signals (e.g. from Docker)
  process.on("SIGTERM", () => process.exit(0))
  process.on("SIGINT", () => process.exit(0))

  if (foundCommand) {
    commands[command]?.()
      .then((exec: any) => exec(forwardedArgs))
      .then(() => {
        if (command === "build") {
          // ensure process exits after build completes so open handles/connections
          // don't cause process to hang
          process.exit(0)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  } else {
    if (args["--help"] && args._.length === 0) {
      console.log(`
      Usage
        $ blitz <command>
  
      Available commands
        ${Object.keys(commands).join(", ")}
  
      Options
        --env, -e       App environment name
        --version, -v   Version number
        --help, -h      Displays this message
  
      For more information run a command with the --help flag
        $ blitz build --help
    `)
      process.exit(0)
    } else {
      // If the command is not found, we assume it is a command from the bin
      void runCommandFromBin()
    }
  }
}

main().catch((e) => {
  console.error(e)
})
