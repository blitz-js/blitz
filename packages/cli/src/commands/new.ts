import {log} from "@blitzjs/display"
import type {AppGeneratorOptions} from "@blitzjs/generator"
import {getLatestVersion} from "@blitzjs/generator"
import {flags} from "@oclif/command"
import chalk from "chalk"
import spawn from "cross-spawn"
import hasbin from "hasbin"
import {lt} from "semver"
const debug = require("debug")("blitz:new")

import {Command} from "../command"
import {PromptAbortedError} from "../errors/prompt-aborted"
import {runPrisma} from "./prisma"

export interface Flags {
  js: boolean
  "skip-install": boolean
  "skip-upgrade": boolean
  "dry-run": boolean
  "no-git": boolean
  npm: boolean
  pnpm: boolean
}
type PkgManager = "npm" | "yarn" | "pnpm"

const IS_YARN_INSTALLED = hasbin.sync("yarn")
const IS_PNPM_INSTALLED = hasbin.sync("pnpm")
const PREFERABLE_PKG_MANAGER: PkgManager = IS_YARN_INSTALLED
  ? "yarn"
  : IS_PNPM_INSTALLED
  ? "pnpm"
  : "npm"

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
      allowNo: true,
    }),
    pnpm: flags.boolean({
      description: "Use pnpm as the package manager. Yarn is the default if installed",
      default: false,
      hidden: !IS_PNPM_INSTALLED,
      allowNo: true,
    }),
    "skip-install": flags.boolean({
      description: "Skip package installation",
      hidden: true,
      default: false,
      allowNo: true,
    }),
    "dry-run": flags.boolean({
      char: "d",
      description: "Show what files will be created without writing them to disk",
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

  private pkgManager: PkgManager = PREFERABLE_PKG_MANAGER
  private shouldInstallDeps = true

  async run() {
    const {args, flags} = this.parse(New)
    debug("args: ", args)
    debug("flags: ", flags)

    await this.determinePkgManagerToInstallDeps(flags)
    const {pkgManager, shouldInstallDeps} = this

    if (!flags["skip-upgrade"]) {
      const latestVersion = (await getLatestVersion("blitz")).value || this.config.version
      if (lt(this.config.version, latestVersion)) {
        if (await this.promptBlitzUpgrade(latestVersion)) {
          this.upgradeGloballyInstalledBlitz()

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

              const flagsArr = (Object.keys(flags) as (keyof Flags)[]).reduce(
                (arr, key) => (flags[key] ? [...arr, `--${key}`] : arr),
                [] as string[],
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

      const form = await this.promptFormLib()

      const {"dry-run": dryRun, "no-git": skipGit} = flags
      const needsInstall = dryRun || !shouldInstallDeps
      const postInstallSteps = args.name === "." ? [] : [`cd ${args.name}`]
      const AppGenerator = require("@blitzjs/generator").AppGenerator

      const generatorOpts: AppGeneratorOptions = {
        destinationRoot,
        appName,
        dryRun,
        useTs: !flags.js,
        yarn: pkgManager === "yarn",
        pnpm: pkgManager === "pnpm",
        form,
        version: this.config.version,
        skipInstall: !shouldInstallDeps,
        skipGit,
        onPostInstall: async () => {
          const spinner = log.spinner(log.withBrand("Initializing SQLite database")).start()
          try {
            // Required in order for DATABASE_URL to be available
            require("dotenv-expand")(require("dotenv-flow").config({silent: true}))
            const result = await runPrisma(["migrate", "dev", "--name", "Initial migration"], true)
            if (!result) throw new Error()

            spinner.succeed()
          } catch (error) {
            spinner.fail()
            postInstallSteps.push(
              "blitz prisma migrate dev (when asked, you can name the migration anything)",
            )
          }
        },
      }
      const generator = new AppGenerator(generatorOpts)

      this.log("\n" + log.withBrand("Hang tight while we set up your new Blitz app!") + "\n")
      await generator.run()

      if (needsInstall) {
        postInstallSteps.push(this.installDepsCmd)
        postInstallSteps.push(
          "blitz prisma migrate dev (when asked, you can name the migration anything)",
        )
      }

      postInstallSteps.push("blitz dev")

      this.log("\n" + log.withBrand("Your new Blitz app is ready! Next steps:") + "\n")

      postInstallSteps.forEach((step, index) => {
        this.log(chalk.yellow(`   ${index + 1}. ${step}`))
      })
      this.log("") // new line
    } catch (err) {
      if (err instanceof PromptAbortedError) this.exit(0)
      this.error(err as any)
    }
  }

  // TODO:: dry run
  private async determinePkgManagerToInstallDeps(flags: Flags): Promise<void> {
    if (flags["skip-install"]) {
      this.shouldInstallDeps = false
      return
    }
    if (flags.npm || flags.pnpm) {
      if (flags.npm) {
        this.pkgManager = "npm"
      } else if (flags.pnpm) {
        if (IS_PNPM_INSTALLED) {
          this.pkgManager = "pnpm"
        } else {
          this.warn(`Pnpm is not installed. Fallback to ${this.pkgManager}`)
        }
      }
    } else {
      const hasPkgManagerChoice = IS_YARN_INSTALLED || IS_PNPM_INSTALLED
      if (hasPkgManagerChoice) {
        const {pkgManager}: any = await this.enquirer.prompt({
          type: "select",
          name: "pkgManager",
          message: "Install dependencies?",
          initial: PREFERABLE_PKG_MANAGER as any,
          choices: [
            {
              name: "npm",
              message: "via npm",
            },
            IS_YARN_INSTALLED && {
              name: "yarn",
              message: "via yarn",
            },
            IS_PNPM_INSTALLED && {
              name: "pnpm",
              message: "via pnpm",
            },
            "skip",
          ].filter(Boolean),
        })
        if (pkgManager === "skip") {
          this.shouldInstallDeps = false
        } else {
          this.pkgManager = pkgManager
        }
      } else {
        const {installDeps}: any = await this.enquirer.prompt({
          type: "confirm",
          name: "installDeps",
          message: "Install dependencies?",
          initial: true,
        })
        this.shouldInstallDeps = installDeps
      }
    }
  }

  private upgradeGloballyInstalledBlitz() {
    let globalBlitzOwner = this.getGlobalBlitzPkgManagerOwner()
    const upgradeOpts =
      globalBlitzOwner === "yarn" ? ["global", "add", "blitz"] : ["i", "-g", "blitz@latest"]
    spawn.sync(globalBlitzOwner, upgradeOpts, {stdio: "inherit"})
  }
  private getGlobalBlitzPkgManagerOwner(): PkgManager {
    if (IS_YARN_INSTALLED) {
      const output = spawn.sync("yarn", ["global", "list"], {stdio: "pipe"})
      if (output && output.stdout.toString().includes("blitz@")) {
        return "yarn"
      }
    } else if (IS_PNPM_INSTALLED) {
      const output = spawn.sync("pnpm", ["list", "-g", "--depth", "0"], {stdio: "pipe"})
      if (output && output.stdout.toString().includes("blitz ")) {
        return "pnpm"
      }
    }
    return "npm"
  }

  private async promptFormLib(): Promise<AppGeneratorOptions["form"]> {
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
    return promptResult.form
  }
  private async promptBlitzUpgrade(latestVersion: string): Promise<boolean> {
    const upgradeChoices: Array<{name: string; message?: string}> = [
      {name: "yes", message: `Yes - Upgrade to ${latestVersion}`},
      {
        name: "no",
        message: `No - Continue with old version (${this.config.version}) - NOT recommended`,
      },
    ]

    const promptResult: any = await this.enquirer.prompt({
      type: "select",
      name: "upgrade",
      message: "Your global blitz version is outdated. Upgrade?",
      choices: upgradeChoices,
    })
    return promptResult.upgrade === "yes"
  }

  private get installDepsCmd(): string {
    switch (this.pkgManager) {
      case "yarn":
        return "yarn"
      case "npm":
        return "npm install"
      case "pnpm":
        return "pnpm install"
      default:
        return "npm install"
    }
  }
}
