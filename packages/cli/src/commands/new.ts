import * as path from "path"
import {flags} from "@oclif/command"
import {Command} from "../command"
import {AppGenerator, AppGeneratorOptions} from "@blitzjs/generator"
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
    "no-git": flags.boolean({
      description: "Skip git repository creation",
      default: false,
    }),
  }

  async run() {
    const {args, flags} = this.parse(New)
    debug("args: ", args)
    debug("flags: ", flags)

    try {
      const destinationRoot = path.resolve(args.name)
      const appName = path.basename(destinationRoot)

      const formChoices: Array<{name: AppGeneratorOptions["form"]; message?: string}> = [
        {name: "React Final Form", message: "React Final Form (recommended)"},
        {name: "React Hook Form"},
        {name: "Formik"},
      ]

      const promptResult: any = await this.enquirer.prompt({
        type: "select",
        name: "form",
        message: "Pick a form library (you can switch to something else later if you want)",
        choices: formChoices,
      })

      const generator = new AppGenerator({
        destinationRoot,
        appName,
        dryRun: flags["dry-run"],
        useTs: !flags.js,
        yarn: !flags.npm,
        form: promptResult.form,
        version: this.config.version,
        skipInstall: flags["skip-install"],
        skipGit: flags["no-git"],
      })

      this.log("\n" + log.withBrand("Hang tight while we set up your new Blitz app!") + "\n")
      await generator.run()
      this.log("\n" + log.withBrand("Your new Blitz app is ready! Next steps:") + "\n")
      this.log(chalk.yellow(`   1. cd ${args.name}`))
      this.log(
        chalk.yellow(`   2. blitz db migrate (when asked, you can name the migration anything)`),
      )
      this.log(chalk.yellow(`   3. blitz start`))
    } catch (err) {
      if (err instanceof PromptAbortedError) this.exit(0)

      this.error(err)
    }
  }
}
