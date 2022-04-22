import { NON_STANDARD_NODE_ENV } from "./utils/constants"
import arg from "arg"
import packageJson from "../../package.json"
import { loadEnvConfig } from "../env-utils"
import { getCommandBin } from "./utils/config"
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
const commands: { [command: string]: () => Promise<CliCommand> } = {
  dev: () => import("./commands/next/dev").then((i) => i.dev),
  build: () => import("./commands/next/build").then((i) => i.build),
  start: () => import("./commands/next/start").then((i) => i.start),
  next: async () => (argv) => {
    if (argv?.[0] && ["dev", "start", "build"].includes(argv[0])) {
      const command = argv[0] as "dev" | "start" | "build"
      return import("./commands/next").then((i) => i[command]())
    }
    console.error(`Invalid command provided: "blitz next ${argv?.[0]}".`)
  },
  new: () => import("./commands/new").then((i) => i.newApp),
  generate: () => import("./commands/generate").then((i) => i.generate),
  codegen: () => import("./commands/codegen").then((i) => i.codegen),
  prisma: () => import("./commands/prisma").then((i) => i.prisma),
}

const args = arg(commonArgs, {
  permissive: true,
})

if (args["--env"]) {
  process.env.APP_ENV = args["--env"]
}

loadEnvConfig(process.cwd(), undefined, { error: console.error, info: console.info })

// Version is inlined into the file using taskr build pipeline
if (args["--version"]) {
  console.log(`Blitz.js v${packageJson.version}`)
  process.exit(0)
}

const foundCommand = Boolean(commands[args._[0] as string])

if (!foundCommand && args["--help"]) {
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
}

const command = foundCommand ? (args._[0] as string) : defaultCommand
const forwardedArgs = foundCommand ? args._.slice(1) : args._

if (args["--help"]) {
  forwardedArgs.push("--help")
}

if (args["--env"]) {
  process.env.APP_ENV = args["--env"]
}

const defaultEnv = command === "dev" ? "development" : "production"

const standardEnv = ["production", "development", "test"]
if (process.env.NODE_ENV && !standardEnv.includes(process.env.NODE_ENV)) {
  console.warn(NON_STANDARD_NODE_ENV)
}
; (process.env as any).NODE_ENV = process.env.NODE_ENV || defaultEnv

// Make sure commands gracefully respect termination signals (e.g. from Docker)
process.on("SIGTERM", () => process.exit(0))
process.on("SIGINT", () => process.exit(0))

async function runCommandFromBin() {
  const command = args._[0] as string
  let commandBin: string | null = null
  try {
    commandBin = await getCommandBin(command)
  } catch (e: any) {
    console.error(e.message)
  }

  if (!commandBin) {
    process.exit(1)
  }

  console.log(`Running command...`)
  const result = spawn.sync(commandBin, forwardedArgs, { stdio: "inherit" })
  process.exit(result.status || 0)
}

if (!foundCommand) {
  runCommandFromBin()
}

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
