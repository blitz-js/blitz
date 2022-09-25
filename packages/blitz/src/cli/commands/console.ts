import {CliCommand} from "../index"
// import arg from "arg"
// import {join} from "path"
import {REGISTER_INSTANCE} from "ts-node"
import chalk from "chalk"
import {log} from "../../logging"
import {runRepl} from "../utils/next-console"

const projectRoot = require("pkg-dir").sync() || process.cwd()
const isTypeScript = require("fs").existsSync(require("path").join(projectRoot, "tsconfig.json"))

// const args = arg(
//   {
//     // Types
//     "--help": Boolean,
//     "--env": String,
//     "--file": String,

//     // Aliases
//     "-h": "--help",
//     "-e": "--env",
//     "-f": "--file",
//   },
//   {
//     permissive: true,
//   },
// )

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

  if (isTypeScript) {
    if (!process[REGISTER_INSTANCE]) {
      require("ts-node").register({compilerOptions: {module: "commonjs"}})
    }
    require("tsconfig-paths/register")
  }

  await runRepl(replOptions)
}

export {consoleREPL}
