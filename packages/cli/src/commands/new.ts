import * as path from "path"
import {flags} from "@oclif/command"
import {Command} from "../command"
import {AppGenerator} from "@blitzjs/generator"
import chalk from "chalk"
import hasbin from "hasbin"
import {log} from "@blitzjs/display"
const debug = require("debug")("blitz:new")

import {PromptAbortedError} from "../errors/prompt-aborted"

export interface Flags {
  ts: boolean
  yarn: boolean
  "skip-install": boolean
}

export class New extends Command {
  static description = "Create a new Blitz project"

  static args = [
    {
      name: "name",
      required: true,
      description: "name of your new project",
    },
  ]

  static flags = {
    help: flags.help({char: "h"}),
    js: flags.boolean({
      description: "Generates a JS project. TypeScript is the default unless you add this flag.",
      default: false,
      hidden: true,
    }),
    npm: flags.boolean({
      description: "Use npm as the package manager. Yarn is the default if installed",
      default: !hasbin.sync("yarn"),
      allowNo: true,
    }),
    "skip-install": flags.boolean({
      description: "Skip package installation",
      hidden: true,
      default: false,
      allowNo: true,
    }),
    "dry-run": flags.boolean({
      description: "show what files will be created without writing them to disk",
    }),
  }

  async run() {
    const {args, flags} = this.parse(New)
    debug("args: ", args)
    debug("flags: ", flags)

    const destinationRoot = path.resolve(args.name)
    const appName = path.basename(destinationRoot)

    const generator = new AppGenerator({
      destinationRoot,
      appName,
      dryRun: flags["dry-run"],
      useTs: !flags.js,
      yarn: !flags.npm,
      version: this.config.version,
      skipInstall: flags["skip-install"],
    })

    try {
      this.log("\n" + log.withBrand("Hang tight while we set up your new Blitz app!") + "\n")
      await generator.run()
      this.log("\n" + log.withBrand("Your new Blitz app is ready! Next steps:") + "\n")
      this.log(chalk.yellow(`   1. cd ${args.name}`))
      this.log(chalk.yellow(`   2. blitz start`))
      this.log(chalk.yellow(`   3. You create new pages by placing components inside app/pages/\n`))
    } catch (err) {
      if (err instanceof PromptAbortedError) this.exit(0)

      this.error(err)
    }
  }
}
