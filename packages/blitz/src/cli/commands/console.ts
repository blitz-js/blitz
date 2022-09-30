import {CliCommand} from "../index"
import arg from "arg"
import chalk from "chalk"
import {log} from "../../logging"
import {runRepl, getDbFolder} from "../utils/next-console"

const args = arg(
  {
    // Types
    "--only-db": Boolean,

    // Aliases
    "-d": "--only-db",
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
    chalk.yellow(`      - Use your db like this: ${getDbFolder()}.project.findMany()`),
  )
  console.log(chalk.yellow("      - Use your queries/mutations like this: getProjects({})"))

  const {register} = require("esbuild-register/dist/node")

  const {unregister} = register({
    target: "es6",
  })

  const onlyDb = args["--only-db"] as boolean
  if (onlyDb) {
    console.log(chalk.green(`Loading only ${getDbFolder()} module`))
  }
  await runRepl(replOptions, onlyDb)

  unregister()
}

export {consoleREPL}
