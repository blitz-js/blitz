import {CliCommand} from "../index"
import arg from "arg"
import chalk from "chalk"
import {log} from "../../logging"
import {runRepl, getDbFolder} from "../utils/next-console"

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
  console.log(
    chalk.yellow(`      - Use your db like this: await ${getDbFolder()}.project.findMany()`),
  )
  console.log(chalk.yellow("      - Use your queries/mutations like this: await getProjects({})"))

  const {register} = require("esbuild-register/dist/node")

  const {unregister} = register({
    target: "es6",
  })

  const skipPreload = args["--skip-preload"] as boolean
  if (skipPreload) {
    console.log(chalk.green(`Pre-loading ${getDbFolder()} module`))
  }
  await runRepl(replOptions, skipPreload)

  unregister()
}

export {consoleREPL}
