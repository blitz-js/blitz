import {flags} from "@oclif/command"
import {Command} from "../command"
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
      const destinationRoot = require("path").resolve(args.name)
      const appName = require("path").basename(destinationRoot)

      const {"dry-run": dryRun, "skip-install": skipInstall, npm} = flags

      const generator = new (require("@blitzjs/generator").AppGenerator)({
        destinationRoot,
        appName,
        dryRun,
        useTs: !flags.js,
        yarn: !npm,
        version: this.config.version,
        skipInstall,
        skipGit: flags["no-git"],
      })

      this.log("\n" + log.withBrand("Hang tight while we set up your new Blitz app!") + "\n")
      await generator.run()

      const postInstallSteps = [`cd ${args.name}`]
      const needsInstall = dryRun || skipInstall

      if (needsInstall) {
        postInstallSteps.push(npm ? "npm install" : "yarn")
        postInstallSteps.push("blitz db migrate (when asked, you can name the migration anything)")
      } else {
        const spinner = log.spinner(log.withBrand("Initializing SQLite database")).start()

        try {
          // Required in order for DATABASE_URL to be available
          require("dotenv-expand")(require("dotenv-flow").config({silent: true}))
          await require("./db").Db.run(["migrate", "--name", "Initial Migration"])
          spinner.succeed()
        } catch {
          spinner.fail()
          postInstallSteps.push(
            "blitz db migrate (when asked, you can name the migration anything)",
          )
        }
      }

      postInstallSteps.push("blitz start")

      this.log("\n" + log.withBrand("Your new Blitz app is ready! Next steps:") + "\n")

      postInstallSteps.forEach((step, index) => {
        this.log(chalk.yellow(`   ${index + 1}. ${step}`))
      })
      this.log("") // new line
    } catch (err) {
      if (err instanceof PromptAbortedError) this.exit(0)

      this.error(err)
    }
  }
}
