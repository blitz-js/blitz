import {loadEnvConfig} from "@blitzjs/env"
import type {AppGeneratorOptions} from "@blitzjs/generator"
import {getLatestVersion} from "@blitzjs/generator"
import {flags} from "@oclif/command"
import chalk from "chalk"
import spawn from "cross-spawn"
import hasbin from "hasbin"
import {log} from "next/dist/server/lib/logging"
import {lt} from "semver"
const debug = require("debug")("blitz:new")

import {Command} from "../command"
import {PromptAbortedError} from "../errors/prompt-aborted"
import {runPrisma} from "./prisma"

export interface Flags {
  "skip-install": boolean
  "skip-upgrade": boolean
  "dry-run": boolean
  "no-git": boolean
  npm: boolean
  pnpm: boolean
  yarn: boolean
  form?: string
  template?: string
  language?: string
}
type PkgManager = "npm" | "yarn" | "pnpm"

const IS_YARN_INSTALLED = hasbin.sync("yarn")
const IS_PNPM_INSTALLED = hasbin.sync("pnpm")
const PREFERABLE_PKG_MANAGER: PkgManager = IS_PNPM_INSTALLED
  ? "pnpm"
  : IS_YARN_INSTALLED
  ? "yarn"
  : "npm"

const LANGUAGES = ["TypeScript", "JavaScript"]
const DEFAULT_LANG = "TypeScript"

type Template = "full" | "minimal"
const templates: {[key in Template]: AppGeneratorOptions["template"]} = {
  full: {
    path: "app",
  },
  minimal: {
    path: "minimalapp",
    skipForms: true,
    skipDatabase: true,
  },
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
    language: flags.string({
      description: "Pick your new app language. Options: typescript, javascript.",
      options: ["typescript", "javascript"],
    }),
    npm: flags.boolean({
      description: "Use npm as the package manager",
      allowNo: true,
    }),
    yarn: flags.boolean({
      description: "Use yarn as the package manager",
      default: false,
      hidden: !IS_YARN_INSTALLED,
      allowNo: true,
    }),
    pnpm: flags.boolean({
      description: "Use pnpm as the package manager",
      default: false,
      hidden: !IS_PNPM_INSTALLED,
      allowNo: true,
    }),
    form: flags.string({
      description: "A form library",
      options: ["react-final-form", "react-hook-form", "formik"],
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
    template: flags.string({
      description: "Pick your new app template. Options: full, minimal.",
      options: ["full", "minimal"],
    }),
  }

  private pkgManager: PkgManager = PREFERABLE_PKG_MANAGER
  private shouldInstallDeps = true
  private useTs = true
  private template: AppGeneratorOptions["template"] = templates.full

  async run() {
    const {args, flags} = this.parse(New)
    debug("args: ", args)
    debug("flags: ", flags)

    const shouldUpgrade = !flags["skip-upgrade"]
    if (shouldUpgrade) {
      const wasUpgraded = await this.maybeUpgradeGloballyInstalledBlitz()
      if (wasUpgraded) {
        this.rerunButSkipUpgrade(flags, args)
        return
      }
    }

    await this.determineLanguage(flags)
    await this.determineTemplate(flags)
    await this.determinePkgManagerToInstallDeps(flags)
    const {pkgManager, shouldInstallDeps, template} = this

    try {
      const destinationRoot = require("path").resolve(args.name)
      const appName = require("path").basename(destinationRoot)

      let form: AppGeneratorOptions["form"]
      if (!template.skipForms) {
        form = await this.determineFormLib(flags)
      }

      const {"dry-run": dryRun, "no-git": skipGit} = flags
      const requiresManualInstall = dryRun || !shouldInstallDeps
      const postInstallSteps = args.name === "." ? [] : [`cd ${args.name}`]
      const AppGenerator = require("@blitzjs/generator").AppGenerator

      const generatorOpts: AppGeneratorOptions = {
        template,
        destinationRoot,
        appName,
        dryRun,
        useTs: this.useTs,
        yarn: pkgManager === "yarn",
        pnpm: pkgManager === "pnpm",
        form,
        version: this.config.version,
        skipInstall: !shouldInstallDeps,
        skipGit,
        onPostInstall: async () => {
          if (template.skipDatabase) {
            return
          }
          const spinner = log.spinner(log.withBrand("Initializing SQLite database")).start()
          try {
            // loadEnvConfig is required in order for DATABASE_URL to be available
            // don't print info logs from loadEnvConfig for clear output
            loadEnvConfig(
              process.cwd(),
              undefined,
              {error: console.error, info: () => {}},
              {ignoreCache: true},
            )
            const result = await runPrisma(["migrate", "dev", "--name", "Initial migration"], true)
            if (!result.success) throw new Error()

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

      if (requiresManualInstall) {
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

  // TODO:: there should be some problems with dry run
  private async determinePkgManagerToInstallDeps(flags: Flags): Promise<void> {
    if (flags["skip-install"]) {
      this.shouldInstallDeps = false
      return
    }
    const isPkgManagerSpecifiedAsFlag = flags.npm || flags.pnpm || flags.yarn
    if (isPkgManagerSpecifiedAsFlag) {
      if (flags.npm) {
        this.pkgManager = "npm"
      } else if (flags.pnpm) {
        if (IS_PNPM_INSTALLED) {
          this.pkgManager = "pnpm"
        } else {
          this.warn(`Pnpm is not installed. Fallback to ${this.pkgManager}`)
        }
      } else if (flags.yarn) {
        if (IS_YARN_INSTALLED) {
          this.pkgManager = "yarn"
        } else {
          this.warn(`Yarn is not installed. Fallback to ${this.pkgManager}`)
        }
      }
    } else {
      const hasPkgManagerChoice = IS_YARN_INSTALLED || IS_PNPM_INSTALLED
      if (hasPkgManagerChoice) {
        const {pkgManager} = (await this.enquirer.prompt({
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
        })) as {pkgManager: PkgManager | "skip"}
        if (pkgManager === "skip") {
          this.shouldInstallDeps = false
        } else {
          this.pkgManager = pkgManager
        }
      } else {
        const {installDeps} = (await this.enquirer.prompt({
          type: "confirm",
          name: "installDeps",
          message: "Install dependencies?",
          initial: true,
        })) as {installDeps: boolean}
        this.shouldInstallDeps = installDeps
      }
    }
  }

  private async determineLanguage(flags: Flags): Promise<void> {
    if (flags.language) {
      this.useTs = flags.language === "typescript"
    } else {
      const {language} = (await this.enquirer.prompt({
        type: "select",
        name: "language",
        message: "Pick a new project's language",
        initial: LANGUAGES.indexOf(DEFAULT_LANG),
        choices: LANGUAGES,
      })) as {language: typeof LANGUAGES[number]}
      this.useTs = language === "TypeScript"
    }
  }

  private async determineFormLib(flags: Flags): Promise<NonNullable<AppGeneratorOptions["form"]>> {
    if (flags.form) {
      switch (flags.form) {
        case "react-final-form":
          return "React Final Form"
        case "react-hook-form":
          return "React Hook Form"
        case "formik":
          return "Formik"
      }
    }
    const formChoices: Array<{
      name: NonNullable<AppGeneratorOptions["form"]>
      message?: string
    }> = [
      {name: "React Final Form", message: "React Final Form (recommended)"},
      {name: "React Hook Form"},
      {name: "Formik"},
    ]

    const promptResult = (await this.enquirer.prompt({
      type: "select",
      name: "form",
      message: "Pick a form library (you can switch to something else later if you want)",
      choices: formChoices,
    })) as {form: typeof formChoices[number]["name"]}
    return promptResult.form
  }
  private async determineTemplate(flags: Flags): Promise<void> {
    if (flags.template) {
      this.template = templates[flags.template as "full" | "minimal"]
      return
    }
    const choices: Array<{name: Template; message?: string}> = [
      {name: "full", message: "Full - includes DB and auth (Recommended)"},
      {name: "minimal", message: "Minimal — no DB, no auth"},
    ]
    const {template} = (await this.enquirer.prompt({
      type: "select",
      name: "template",
      message: "Pick your new app template",
      initial: 0,
      choices,
    })) as {template: Template}

    this.template = templates[template]
  }
  private rerunButSkipUpgrade(flags: Flags, args: Record<string, any>) {
    const flagsArr = (Object.keys(flags) as (keyof Flags)[]).reduce(
      (arr, key) => (flags[key] ? [...arr, `--${key}`] : arr),
      [] as string[],
    )
    spawn.sync("blitz", ["new", ...Object.values(args), ...flagsArr, "--skip-upgrade"], {
      stdio: "inherit",
    })
  }
  private async maybeUpgradeGloballyInstalledBlitz(): Promise<boolean> {
    const spinner = log
      .spinner(log.withBrand("Checking if a new Blitz release is available"))
      .start()
    const latestVersion = (await getLatestVersion("blitz")).value || this.config.version
    if (lt(this.config.version, latestVersion)) {
      spinner.succeed(log.withBrand("A new Blitz release is available"))
      if (await this.promptBlitzUpgrade(latestVersion)) {
        let globalBlitzOwner = this.getGlobalBlitzPkgManagerOwner()
        const upgradeOpts =
          globalBlitzOwner === "yarn" ? ["global", "add", "blitz"] : ["i", "-g", "blitz@latest"]
        spawn.sync(globalBlitzOwner, upgradeOpts, {stdio: "inherit"})

        const versionResult = spawn.sync("blitz", ["--version"], {stdio: "pipe"})

        if (versionResult.stdout) {
          const newVersion =
            versionResult.stdout.toString().match(/(?<=blitz: )(.*)(?= \(global\))/) || []

          if (newVersion[0] && newVersion[0] === latestVersion) {
            log.success(
              `Upgraded blitz global package to ${newVersion[0]}, running blitz new command...`,
            )

            return true
          }
        }

        this.error(
          "Unable to upgrade blitz, please run `blitz new` again and select No to skip the upgrade",
        )
      }
    } else {
      spinner.succeed(log.withBrand("You have the latest Blitz version"))
    }

    return false
  }
  private getGlobalBlitzPkgManagerOwner(): PkgManager {
    if (IS_PNPM_INSTALLED) {
      const output = spawn.sync("pnpm", ["list", "-g", "--depth", "0"], {stdio: "pipe"})
      if (output && output.stdout.toString().includes("blitz ")) {
        return "pnpm"
      }
    }
    if (IS_YARN_INSTALLED) {
      const output = spawn.sync("yarn", ["global", "list"], {stdio: "pipe"})
      if (output && output.stdout.toString().includes("blitz@")) {
        return "yarn"
      }
    }
    return "npm"
  }
  private async promptBlitzUpgrade(latestVersion: string): Promise<boolean> {
    const upgradeChoices: Array<{name: string; message?: string}> = [
      {name: "yes", message: `Yes - Upgrade to ${latestVersion}`},
      {
        name: "no",
        message: `No - Continue with old version (${this.config.version}) - NOT recommended`,
      },
    ]

    const promptResult = (await this.enquirer.prompt({
      type: "select",
      name: "upgrade",
      message: "Your global blitz version is outdated. Upgrade?",
      choices: upgradeChoices,
    })) as {upgrade: typeof upgradeChoices[number]["name"]}
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
