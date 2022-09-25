import {CliCommand} from "../index"
import arg from "arg"
// import {join} from "path"
import {REGISTER_INSTANCE} from "ts-node"
import chalk from "chalk"
import {log} from "../../logging"
import {runRepl} from "../utils/next-console"

const projectRoot = require("pkg-dir").sync() || process.cwd()
const isTypeScript = require("fs").existsSync(require("path").join(projectRoot, "tsconfig.json"))

const args = arg(
  {
    // Types
    "--skip-preload": Boolean,

    // Aliases
    "-s": "--skip-preload",
  },
  {
    permissive: true,
  },
)

const replOptions = {
  prompt: "⚡️ > ",
  useColors: true,
}

const consoleREPL: CliCommand = async () => {
  process.env.CLI_COMMAND_CONSOLE = "true"
  log.branded("You have entered the Blitz console")
  console.log(chalk.yellow("Tips: - Exit by typing .exit or pressing Ctrl-D"))
  console.log(chalk.yellow("      - Use your db like this: await db.project.findMany()"))
  console.log(chalk.yellow("      - Use your queries/mutations like this: await getProjects({})"))

  const {register} = require("esbuild-register/dist/node")

  const {unregister} = register({
    target: "es6",
  })

  const skipPreload = args["--skip-preload"] as boolean
  if (skipPreload) {
    console.log(chalk.green("Pre-loading only db module"))
  }
  await runRepl(replOptions, skipPreload)

  unregister()
}

export {consoleREPL}
