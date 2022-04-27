import {NON_STANDARD_NODE_ENV} from "./utils/constants"
import arg from "arg"
import packageJson from "../../package.json"
import {loadEnvConfig} from "../env-utils"
import {getCommandBin} from "./utils/config"
import spawn from "cross-spawn"

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

const defaultCommand = "dev"
export type CliCommand = (argv?: string[]) => void
const commands: {[command: string]: () => Promise<CliCommand>} = {
  dev: () => import("./commands/next/dev").then((i) => i.dev),
  build: () => import("./commands/next/build").then((i) => i.build),
  start: () => import("./commands/next/start").then((i) => i.start),
  new: () => import("./commands/new").then((i) => i.newApp),
  generate: () => import("./commands/generate").then((i) => i.generate),
  codegen: () => import("./commands/codegen").then((i) => i.codegen),
}

const args = arg(commonArgs, {
  permissive: true,
})

if (args["--env"]) {
  process.env.APP_ENV = args["--env"]
}

loadEnvConfig(process.cwd(), undefined, {error: console.error, info: console.info})

// Version is inlined into the file using taskr build pipeline
if (args["--version"]) {
  console.log(`Blitz.js v${packageJson.version}`)
  process.exit(0)
}

const foundCommand = Boolean(commands[args._[0] as string])

const command = foundCommand ? (args._[0] as string) : defaultCommand
const forwardedArgs = foundCommand ? args._.slice(1) : args._

if (args["--env"]) {
  process.env.APP_ENV = args["--env"]
}

if (args["--help"]) {
  forwardedArgs.push("--help")
}

const defaultEnv = command === "dev" ? "development" : "production"

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
