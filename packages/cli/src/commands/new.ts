import {flags} from "@oclif/command"
import type {AppGeneratorOptions} from "@blitzjs/generator"
import chalk from "chalk"
import hasbin from "hasbin"
import {log} from "@blitzjs/display"
import {lt} from "semver"
import {getLatestVersion} from "@blitzjs/generator"
import spawn from "cross-spawn"
const debug = require("debug")("blitz:new")

import {Command} from "../command"
import {PromptAbortedError} from "../errors/prompt-aborted"
import {runPrisma} from "./prisma"

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

  static flags: {[flag: string]: any} = {
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
    "skip-upgrade": flags.boolean({
      description: "Skip blitz upgrade if outdated",
      default: false,
    }),
  }

  async run() {
    const {args, flags} = this.parse(New)
    debug("args: ", args)
    debug("flags: ", flags)

    if (!flags["skip-upgrade"]) {
      const latestVersion = (await getLatestVersion("blitz")).value || this.config.version
      if (lt(this.config.version, latestVersion)) {
        const upgradeChoices: Array<{name: string; message?: string}> = [
          {name: "yes", message: `Yes - Upgrade to ${latestVersion}`},
          {
            name: "no",
            message: `No - Continue with old version (${this.config.version}) - NOT recommended`,
          },
        ]

        const promptUpgrade: any = await this.enquirer.prompt({
          type: "select",
          name: "upgrade",
          message: "Your global blitz version is outdated. Upgrade?",
          choices: upgradeChoices,
        })

        if (promptUpgrade.upgrade === "yes") {
          const checkYarn = spawn.sync("yarn", ["global", "list"], {stdio: "pipe"})
          const useYarn = checkYarn.stdout.toString().includes("blitz@")
          const upgradeOpts = useYarn ? ["global", "add", "blitz"] : ["i", "-g", "blitz@latest"]

          spawn.sync(useYarn ? "yarn" : "npm", upgradeOpts, {stdio: "inherit"})

          const versionResult = spawn.sync("blitz", ["--version"], {stdio: "pipe"})

          if (versionResult.stdout) {
            const newVersion =
              versionResult.stdout.toString().match(/(?<=blitz: )(.*)(?= \(global\))/) || []

            if (newVersion[0] && newVersion[0] === latestVersion) {
              this.log(
                chalk.green(
                  `Upgraded blitz global package to ${newVersion[0]}, running blitz new command...`,
                ),
              )

              const flagsArr = Object.keys(flags).reduce(
                (arr: Array<string>, key: string) => (flags[key] ? [...arr, `--${key}`] : arr),
                [],
              )

              spawn.sync("blitz", ["new", ...Object.values(args), ...flagsArr, "--skip-upgrade"], {
                stdio: "inherit",
              })

              return
            }
          }
          this.error(
            "Unable to upgrade blitz, please run `blitz new` again and select No to skip the upgrade",
          )
        }
      }
    }

    try {
      const destinationRoot = require("path").resolve(args.name)
      const appName = require("path").basename(destinationRoot)

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

      const {"dry-run": dryRun, "skip-install": skipInstall, npm} = flags
      const needsInstall = dryRun || skipInstall
      const postInstallSteps = [`cd ${args.name}`]

      const generator = new (require("@blitzjs/generator").AppGenerator)({
        destinationRoot,
        appName,
        dryRun,
        useTs: !flags.js,
        yarn: !npm,
        form: promptResult.form,
        version: this.config.version,
        skipInstall,
        skipGit: flags["no-git"],
        onPostInstall: async () => {
          const spinner = log.spinner(log.withBrand("Initializing SQLite database")).start()

          try {
            // Required in order for DATABASE_URL to be available
            require("dotenv-expand")(require("dotenv-flow").config({silent: true}))
            const result = await runPrisma([
              "migrate",
              "dev",
              "--preview-feature",
              "--name",
              "Initial migration",
            ])
            if (!result) throw new Error()

            spinner.succeed()
          } catch {
            spinner.fail()
            postInstallSteps.push(
              "blitz db migrate (when asked, you can name the migration anything)",
            )
          }
        },
      })

      this.log("\n" + log.withBrand("Hang tight while we set up your new Blitz app!") + "\n")
      await generator.run()

      if (needsInstall) {
        postInstallSteps.push(npm ? "npm install" : "yarn")
        postInstallSteps.push("blitz db migrate (when asked, you can name the migration anything)")
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
