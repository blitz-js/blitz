import {NON_STANDARD_NODE_ENV} from "./utils/constants"
import arg from "arg"
import packageJson from "../../package.json"
import {loadEnvConfig} from "../env-utils"

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

// Don't check for react or react-dom when running blitz new
if (command !== "new") {
  ;["react", "react-dom"].forEach((dependency) => {
    try {
      // When 'npm link' is used it checks the clone location. Not the project.
      require.resolve(dependency)
    } catch (err) {
      console.warn(
        `The module '${dependency}' was not found. Blitz.js requires that you include it in 'dependencies' of your 'package.json'. To add it, run 'npm install ${dependency}'`,
      )
    }
  })
}

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
;(process.env as any).NODE_ENV = process.env.NODE_ENV || defaultEnv

// Make sure commands gracefully respect termination signals (e.g. from Docker)
process.on("SIGTERM", () => process.exit(0))
process.on("SIGINT", () => process.exit(0))

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

if (command === "dev") {
  const {watchFile} = require("fs")
  watchFile(`${process.cwd()}/blitz.config.js`, (cur: any, prev: any) => {
    if (cur.size > 0 || prev.size > 0) {
      console.log(
        `\n> Found a change in blitz.config.js. Restart the server to see the changes in effect.`,
      )
    }
  })
  watchFile(`${process.cwd()}/blitz.config.ts`, (cur: any, prev: any) => {
    if (cur.size > 0 || prev.size > 0) {
      console.log(
        `\n> Found a change in blitz.config.ts. Restart the server to see the changes in effect.`,
      )
    }
  })
}
