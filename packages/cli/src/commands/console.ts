import {Command, flags} from "@oclif/command"

const projectRoot = require("pkg-dir").sync() || process.cwd()
const isTypescript = require("fs").existsSync(require("path").join(projectRoot, "tsconfig.json"))

export class Console extends Command {
  static description = "Run the Blitz console REPL"
  static aliases = ["c"]

  static replOptions = {
    prompt: "⚡️ > ",
    useColors: true,
  }

  static flags = {
    help: flags.help({char: "h"}),
  }

  async run() {
    this.parse(Console)
    const {log} = require("@blitzjs/display")
    const chalk = require("chalk")
    log.branded("You have entered the Blitz console")
    console.log(chalk.yellow("Tips: - Exit by typing .exit or pressing Ctrl-D"))
    console.log(chalk.yellow("      - Use your db like this: await db.project.findMany()"))
    console.log(chalk.yellow("      - Use your queries/mutations like this: await getProjects({})"))

    if (isTypescript) {
      require("../utils/setup-ts-node").setupTsnode()
    }

    require("@blitzjs/repl").runRepl(Console.replOptions)
  }
}
