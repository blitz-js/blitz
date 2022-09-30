import arg from "arg"
import spawn from "cross-spawn"

import {loadEnvConfig} from "../utils/env"
import {NON_STANDARD_NODE_ENV} from "./utils/constants"
import {getCommandBin} from "./utils/config"
import {readVersions} from "./utils/read-versions"

import {getPkgManager} from "./utils/helpers"

const commonArgs = {
  // Flags
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

export type CliCommand = (argv?: string[]) => void

const commands = {
  dev: () => import("./commands/next/dev").then((i) => i.dev),
  build: () => import("./commands/next/build").then((i) => i.build),
  start: () => import("./commands/next/start").then((i) => i.start),
  new: () => import("./commands/new").then((i) => i.newApp),
  generate: () => import("./commands/generate").then((i) => i.generate),
  codegen: () => import("./commands/codegen").then((i) => i.codegen),
  db: () => import("./commands/db").then((i) => i.db),
  console: () => import("./commands/console").then((i) => i.consoleREPL),
}

const aliases: Record<string, keyof typeof commands> = {
  d: "dev",
  b: "build",
  s: "start",
  n: "new",
  g: "generate",
  c: "console",
}

type Command = keyof typeof commands
type Alias = keyof typeof aliases

let blitzCommand: Command | undefined
if (commands[args._[0] as Command]) {
  blitzCommand = args._[0] as Command
}
if (aliases[args._[0] as Alias]) {
  blitzCommand = aliases[args._[0] as Alias]
}

const forwardedArgs = blitzCommand ? args._.slice(1) : args._

async function runCommandFromBin() {
  if (!args._[0]) {
    console.log("No command specified")
    process.exit(1)
  }
  let commandBin: string | null = null

  try {
    commandBin = await getCommandBin(args._[0])
  } catch (e: any) {
    console.error(`Error: ${e.message}`)
  }

  if (!commandBin) {
    process.exit(1)
  }

  const result = spawn.sync(commandBin, args._.slice(1), {stdio: "inherit"})
  process.exit(result.status || 0)
}

async function printEnvInfo() {
  const osName = await import("os-name")
  const envinfo = await import("envinfo")

  const pkgManager = getPkgManager()
  const env = await envinfo.default.run(
    {
      System: ["OS", "CPU", "Memory", "Shell"],
      Binaries: ["Node", "Yarn", "npm", "pnpm"],
      npmPackages: [
        "blitz",
        "@blitzjs/rpc",
        "@blitzjs/auth",
        "@blitzjs/next",
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

  const {globalVersion, localVersions} = readVersions()
  if (globalVersion) {
    console.log(`Blitz version: ${globalVersion} (global)`)
  }

  if (localVersions.blitz) {
    console.log(`Blitz version: ${localVersions.blitz} (local)`)
  }

  console.log(
    `${osName.default()} | ${process.platform}-${process.arch} | Node: ${process.version}\n`,
  )
  console.log(`\n Package manager: ${pkgManager}`)
  console.log(env)
  process.exit(0)
}

async function main() {
  if (args["--env"]) {
    process.env.APP_ENV = args["--env"]
  }

  // Version is inlined into the file using taskr build pipeline
  if (args["_"].length === 0 && args["--version"]) {
    await printEnvInfo()
  }

  if (args["--help"]) {
    forwardedArgs.push("--help")
  }

  // env variable should default to dev unless the command is build or start
  const defaultEnv =
    blitzCommand === "build" || blitzCommand === "start" ? "production" : "development"

  const standardEnv = ["production", "development", "test"]
  if (process.env.NODE_ENV && !standardEnv.includes(process.env.NODE_ENV)) {
    console.warn(NON_STANDARD_NODE_ENV)
  }

  process.env.NODE_ENV = process.env.NODE_ENV || defaultEnv
  loadEnvConfig(process.cwd(), undefined, {error: console.error, info: console.info})
  // Make sure commands gracefully respect termination signals (e.g. from Docker)
  process.on("SIGTERM", () => process.exit(0))
  process.on("SIGINT", () => process.exit(0))

  if (blitzCommand) {
    const commandFn = commands[blitzCommand]
    commandFn?.()
      .then((exec: any) => exec(forwardedArgs))
      .then(() => {
        if (blitzCommand === "build") {
          // ensure process exits after build completes so open handles/connections
          // don't cause process to hang
          process.exit(0)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  } else {
    if (args["--help"] && forwardedArgs.length === 1 && forwardedArgs[0] === "--help") {
      console.log(`
      Usage
        $ blitz <command>
  
      Available commands
        dev, d          Start a development server 🪄
        build, b        Create a production build 🏗️
        start, s        Start the production server 🐎
        new, n          Create a new Blitz project ✨
        generate, g     Generate new files for your Blitz project 🤠
        codegen         Run the blitz codegen 🤖
        db              Run database commands 🗄️
        
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
