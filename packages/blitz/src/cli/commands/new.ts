import prompts from "prompts"
import path from "path"
import chalk from "chalk"
import hasbin from "hasbin"
import {CliCommand} from "../index"
import arg from "arg"
import {AppGenerator, AppGeneratorOptions, getLatestVersion} from "@blitzjs/generator"
import {loadEnvConfig} from "../../utils/env"
import {runPrisma} from "../../utils/run-prisma"
import {checkLatestVersion} from "../utils/check-latest-version"
import {codegenTasks} from "../utils/codegen-tasks"

type NotUndefined<T> = T extends undefined ? never : T
const forms: Record<NotUndefined<AppGeneratorOptions["form"]>, string> = {
  formik: "Formik (Recommended)",
  finalform: "React Final Form",
  hookform: "React Hook Form",
}

const language = {
  typescript: "TypeScript",
}

type TLanguage = keyof typeof language

type TPkgManager = "npm" | "yarn" | "pnpm"
const installCommandMap: Record<TPkgManager, string> = {
  yarn: "yarn",
  pnpm: "pnpm install",
  npm: "npm install",
}

type TTemplate = "app" | "pages" | "minimal"
const templates: {[key in TTemplate]: AppGeneratorOptions["template"]} = {
  app: {
    path: "app",
  },
  pages: {
    path: "pages",
  },
  minimal: {
    path: "minimalapp",
    skipForms: true,
    skipDatabase: true,
  },
}

const IS_YARN_INSTALLED = hasbin.sync("yarn")
const IS_PNPM_INSTALLED = hasbin.sync("pnpm")
const PREFERABLE_PKG_MANAGER: TPkgManager = IS_PNPM_INSTALLED
  ? "pnpm"
  : IS_YARN_INSTALLED
  ? "yarn"
  : "npm"

const args = arg(
  {
    // Types
    "--npm": Boolean,
    "--yarn": Boolean,
    "--pnpm": Boolean,
    "--form": String,
    "--language": String,
    "--template": String,
    "--skip-install": Boolean,
    "--dry-run": Boolean,
    "--no-git": Boolean,
    "--skip-upgrade": Boolean,

    // Aliases
  },
  {
    permissive: true,
  },
)

let projectName: string = ""
let projectPath: string = ""
let projectLanguage: string | TLanguage = language.typescript
let projectFormLib: AppGeneratorOptions["form"] = "formik"
let projectTemplate: AppGeneratorOptions["template"] = templates.app
let projectPkgManger: TPkgManager = PREFERABLE_PKG_MANAGER
let shouldInstallDeps: boolean = true

const determineProjectName = async () => {
  if (args._.slice(1).length < 1) {
    const res = await prompts({
      type: "text",
      name: "name",
      message: "What would you like to name your project?",
      initial: "blitz-app",
    })

    projectName = res.name.trim().replaceAll(" ", "-")
    projectPath = path.resolve(projectName)
  } else {
    projectName = args._.slice(1)[0] as string
    if (projectName === ".") {
      projectName = path.basename(process.cwd())
    }

    projectPath = path.resolve(projectName)
  }
}

const determineFormLib = async () => {
  // Check if form from flag is valid
  if (!args["--form"] || (args["--form"] && !Object.keys(forms).includes(args["--form"]))) {
    const res = await prompts({
      type: "select",
      name: "form",
      message: "Pick a form library (you can switch to something else later if you want)",
      initial: 0,
      choices: Object.entries(forms).map((c) => {
        return {value: c[0], title: c[1]}
      }),
    })

    projectFormLib = res.form
  } else {
    projectFormLib = args["--form"] as AppGeneratorOptions["form"]
  }
}

const determineTemplate = async () => {
  // Check if template from flag is valid
  if (
    !args["--template"] ||
    (args["--template"] && !Object.keys(templates).includes(args["--template"].toLowerCase()))
  ) {
    const choices: Array<{value: keyof typeof templates; title: string}> = [
      {value: "app", title: "App Router – Full Setup: includes DB and auth (Recommended)"},
      {value: "pages", title: "Pages Router – Full Setup: includes DB and auth"},
      {value: "minimal", title: "Pages Router – Minimal setup: no DB, no auth"},
    ]

    const res = await prompts({
      type: "select",
      name: "template",
      message: "Pick your new app template",
      initial: 0,
      choices,
    })

    projectTemplate = templates[res.template as TTemplate]
  } else {
    projectTemplate = templates[args["--template"] as TTemplate]
  }
}

const determinePkgManagerToInstallDeps = async () => {
  if (args["--skip-install"]) {
    shouldInstallDeps = false
    return
  }

  const isPkgManagerSpecifiedAsFlag = args["--npm"] || args["--yarn"] || args["--pnpm"]
  if (isPkgManagerSpecifiedAsFlag) {
    if (args["--npm"]) {
      projectPkgManger = "npm"
    } else if (args["--pnpm"]) {
      if (IS_PNPM_INSTALLED) {
        projectPkgManger = "pnpm"
      } else {
        console.warn(`Pnpm is not installed. Fallback to ${projectPkgManger}`)
      }
    } else if (args["--yarn"]) {
      if (IS_YARN_INSTALLED) {
        projectPkgManger = "yarn"
      } else {
        console.warn(`Yarn is not installed. Fallback to ${projectPkgManger}`)
      }
    }
  } else {
    const hasPkgManagerChoice = IS_YARN_INSTALLED || IS_PNPM_INSTALLED
    if (hasPkgManagerChoice) {
      const res = await prompts({
        type: "select",
        name: "pkgManager",
        message: "Install dependencies?",
        initial: 0,
        choices: [
          {title: "npm", value: "npm"},
          {title: "yarn", value: "yarn", disabled: !IS_YARN_INSTALLED},
          {title: "pnpm", value: "pnpm", disabled: !IS_PNPM_INSTALLED},
          {title: "skip", value: "skip"},
        ],
      })

      if (res.pkgManager === "skip") {
        projectPkgManger = PREFERABLE_PKG_MANAGER
      } else {
        projectPkgManger = res.pkgManager
      }

      shouldInstallDeps = res.pkgManager !== "skip"
    } else {
      const res = await prompts({
        type: "confirm",
        name: "installDeps",
        message: "Install dependencies?",
        initial: true,
      })
      shouldInstallDeps = res.installDeps
    }
  }
}

const newApp: CliCommand = async () => {
  const shouldUpgrade = !args["--skip-upgrade"]
  if (shouldUpgrade) {
    await checkLatestVersion()
  }

  await determineProjectName()
  await determineTemplate()
  await determinePkgManagerToInstallDeps()
  if (!projectTemplate.skipForms) {
    await determineFormLib()
  }

  try {
    const latestBlitzVersion = (await getLatestVersion("blitz")).value
    const requireManualInstall = args["--dry-run"] || !shouldInstallDeps
    const postInstallSteps = projectName === "." ? [] : [`cd ${projectName}`]

    const generatorOpts: AppGeneratorOptions = {
      template: projectTemplate,
      destinationRoot: projectPath,
      appName: projectName,
      useTs: projectLanguage === "TypeScript",
      yarn: projectPkgManger === "yarn",
      pnpm: projectPkgManger === "pnpm",
      dryRun: args["--dry-run"] ? args["--dry-run"] : false,
      skipGit: args["--no-git"] ? args["--no-git"] : false,
      skipInstall: !shouldInstallDeps,
      version: latestBlitzVersion,
      form: projectFormLib,
      onPostInstall: async () => {
        if (projectTemplate.skipDatabase) {
          return
        }
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

          if (projectPkgManger === "yarn") {
            await codegenTasks()
          }
        } catch (error) {
          postInstallSteps.push(
            "blitz prisma migrate dev (when asked, you can name the migration anything)",
          )
        }
      },
    }

    const generator = new AppGenerator(generatorOpts)
    console.log("Hang tight while we set up your new Blitz app!")
    await generator.run()

    if (requireManualInstall) {
      postInstallSteps.push(installCommandMap[projectPkgManger])
      postInstallSteps.push(
        "blitz prisma migrate dev (when asked, you can name the migration anything)",
      )
    }

    postInstallSteps.push(`${projectPkgManger} ${projectPkgManger === "npm" ? "run " : ""}dev`);

    console.log("\n Your new Blitz app is ready! Next steps:")
    postInstallSteps.forEach((step, index) => {
      console.log(chalk.yellow(`   ${index + 1}. ${step}`))
    })
    console.log("") // new line
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

export {newApp}
