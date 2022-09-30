import spawn from "cross-spawn"
import chalk from "chalk"
import {readJSONSync, writeJson} from "fs-extra"
import {join} from "path"
import username from "username"
import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {baseLogger, log} from "../utils/log"
import {fetchLatestVersionsFor} from "../utils/fetch-latest-version-for"
import {getBlitzDependencyVersion} from "../utils/get-blitz-dependency-version"

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

type TemplateConfig = {
  path: string
  skipForms?: boolean
  skipDatabase?: boolean
}

export interface AppGeneratorOptions extends GeneratorOptions {
  template: TemplateConfig
  appName: string
  useTs: boolean
  yarn: boolean
  pnpm?: boolean
  version: string
  skipInstall: boolean
  skipGit: boolean
  form: "finalform" | "hookform" | "formik"
  onPostInstall?: () => Promise<void>
}

type PkgManager = "npm" | "yarn" | "pnpm"

export class AppGenerator extends Generator<AppGeneratorOptions> {
  sourceRoot: SourceRootType = {type: "template", path: this.options.template.path}
  // Disable file-level prettier because we manually run prettier at the end
  prettierDisabled = true
  packageInstallSuccess: boolean = false

  filesToIgnore() {
    if (!this.options.useTs) {
      return [
        "tsconfig.json",
        "next-env.d.ts",
        "jest.config.ts",
        "package.ts.json",
        "pre-push-ts",
        "types.ts",
      ]
    }
    return ["jsconfig.json", "package.js.json", "pre-push-js"]
  }

  async getTemplateValues() {
    return {
      name: this.options.appName,
      safeNameSlug: this.options.appName.replace(/[^a-zA-Z0-9-_]/g, "-"),
      username: await username(),
    }
  }

  getTargetDirectory() {
    return ""
  }

  // eslint-disable-next-line require-await
  async preCommit() {
    this.fs.move(this.destinationPath("gitignore"), this.destinationPath(".gitignore"))
    this.fs.move(this.destinationPath("npmrc"), this.destinationPath(".npmrc"))
    this.fs.move(
      this.destinationPath(this.options.useTs ? ".husky/pre-push-ts" : ".husky/pre-push-js"),
      this.destinationPath(".husky/pre-push"),
    )
    this.fs.move(
      this.destinationPath(this.options.useTs ? "package.ts.json" : "package.js.json"),
      this.destinationPath("package.json"),
    )

    const rpcEndpointPath = `pages/api/rpc/blitzrpcroute.${this.options.useTs ? "ts" : "js"}`
    if (this.fs.exists(rpcEndpointPath)) {
      this.fs.move(
        this.destinationPath(rpcEndpointPath),
        this.destinationPath(`pages/api/rpc/[[...blitz]].${this.options.useTs ? "ts" : "js"}`),
      )
    }

    if (!this.options.template.skipForms) {
      this.updateForms()
    }
  }

  async postWrite() {
    const {pkgManager} = this
    let gitInitSuccessful
    if (!this.options.skipGit) {
      const initResult = spawn.sync("git", ["init"], {
        stdio: "ignore",
      })

      gitInitSuccessful = initResult.status === 0
      if (!gitInitSuccessful) {
        baseLogger({displayDateTime: false}).warn("Failed to run git init.")
        baseLogger({displayDateTime: false}).warn(
          "Find out more about how to install git here: https://git-scm.com/downloads.",
        )
      }
    }
    const pkgJsonLocation = join(this.destinationPath(), "package.json")
    const pkg = readJSONSync(pkgJsonLocation)

    console.log("") // New line needed
    const spinner = log.spinner(log.withBrand("Retrieving the freshest of dependencies")).start()

    const [
      {value: newDependencies, isFallback: dependenciesUsedFallback},
      {value: newDevDependencies, isFallback: devDependenciesUsedFallback},
      {value: blitzDependencyVersion},
    ] = await Promise.all([
      fetchLatestVersionsFor(pkg.dependencies),
      fetchLatestVersionsFor(pkg.devDependencies),
      getBlitzDependencyVersion(),
    ])

    pkg.dependencies = newDependencies
    pkg.devDependencies = newDevDependencies
    pkg.dependencies.blitz = blitzDependencyVersion
    pkg.dependencies["@blitzjs/next"] = blitzDependencyVersion
    pkg.dependencies["@blitzjs/rpc"] = blitzDependencyVersion
    pkg.dependencies["@blitzjs/auth"] = blitzDependencyVersion

    const fallbackUsed = dependenciesUsedFallback || devDependenciesUsedFallback

    await writeJson(pkgJsonLocation, pkg, {spaces: 2})

    if (!fallbackUsed && !this.options.skipInstall) {
      spinner.succeed()

      await new Promise<void>((resolve) => {
        const logFlag = pkgManager === "yarn" ? "--json" : "--loglevel=error"
        const cp = spawn(pkgManager, ["install", logFlag], {
          stdio: ["inherit", "pipe", "pipe"],
        })

        const getJSON = (data: string) => {
          try {
            return JSON.parse(data)
          } catch {
            return null
          }
        }

        const spinners: any[] = []

        if (pkgManager !== "yarn") {
          const spinner = log
            .spinner(log.withBrand("Installing those dependencies (this will take a few minutes)"))
            .start()
          spinners.push(spinner)
        }

        cp.stdout?.setEncoding("utf8")
        cp.stderr?.setEncoding("utf8")
        cp.stdout?.on("data", (data) => {
          if (pkgManager === "pnpm") {
            if (data.includes("ERR_PNPM_PEER_DEP_ISSUES  Unmet peer dependencies")) {
              spinners[spinners.length - 1]?.succeed()
            }
          }

          if (pkgManager === "yarn") {
            let json = getJSON(data)
            if (json && json.type === "step") {
              spinners[spinners.length - 1]?.succeed()
              const spinner = log.spinner(log.withBrand(json.data.message)).start()
              spinners.push(spinner)
            }
            if (json && json.type === "success") {
              spinners[spinners.length - 1]?.succeed()
            }
          }
        })
        cp.stderr?.on("data", (data) => {
          if (pkgManager === "yarn") {
            let json = getJSON(data)
            if (json && json.type === "error") {
              spinners[spinners.length - 1]?.fail()
              console.error(json.data)
            }
          } else {
            // Hide the annoying Prisma warning about not finding the schema file
            // because we generate the client ourselves
            if (!data.includes("schema.prisma")) {
              console.error(`\n${data}`)
            }
          }
        })
        cp.on("exit", (code) => {
          if (pkgManager !== "yarn" && spinners[spinners.length - 1].isSpinning) {
            if (code !== 0) spinners[spinners.length - 1].fail()
            else {
              spinners[spinners.length - 1].succeed()
              this.packageInstallSuccess = true
            }
          }
          resolve()
        })
      })

      await this.options.onPostInstall?.()

      const runLocalNodeCLI = (command: string) => {
        const {pkgManager} = this
        if (pkgManager === "yarn") {
          return spawn.sync("yarn", ["run", ...command.split(" ")])
        } else if (pkgManager === "pnpm") {
          return spawn.sync("pnpm", command.split(" "))
        } else {
          return spawn.sync("npx", command.split(" "))
        }
      }

      // Ensure the generated files are formatted with the installed prettier version
      if (this.packageInstallSuccess) {
        const formattingSpinner = log.spinner(log.withBrand("Formatting your code")).start()
        const prettierResult = runLocalNodeCLI("prettier --loglevel silent --write .")
        if (prettierResult.status !== 0) {
          formattingSpinner.fail(
            chalk.yellow.bold(
              "We had an error running Prettier, but don't worry your app will still run fine :)",
            ),
          )
        } else {
          formattingSpinner.succeed()
        }
      }
    } else {
      console.log("") // New line needed
      if (this.options.skipInstall) {
        spinner.succeed()
      } else {
        spinner.fail(
          chalk.red.bold(
            `We had some trouble connecting to the network, so we'll skip installing your dependencies right now. Make sure to run ${`${this.pkgManager} install`} once you're connected again.`,
          ),
        )
      }
    }

    if (!this.options.skipGit && gitInitSuccessful) {
      this.commitChanges()
    }
  }

  preventFileFromLogging(path: string): boolean {
    if (path.includes(".env")) return false
    if (path.includes("eslint")) return false

    const filename = path.split("/").pop() as string
    return path[0] === "." || filename[0] === "."
  }

  commitChanges() {
    const commitSpinner = log.spinner(log.withBrand("Committing your app")).start()
    const commands: Array<[string, string[], object]> = [
      ["git", ["add", "."], {stdio: "ignore"}],
      [
        "git",
        ["commit", "--no-verify", "-m", "Brand new Blitz app!"],
        {stdio: "ignore", timeout: 10000},
      ],
    ]
    for (let command of commands) {
      const result = spawn.sync(...command)
      if (result.status !== 0) {
        commitSpinner.fail(
          chalk.red.bold(
            `Failed to run command ${command[0]} with ${command[1].join(" ")} options.`,
          ),
        )
        return
      }
    }
    commitSpinner.succeed()
  }

  private updateForms() {
    const pkg = this.fs.readJSON(this.destinationPath("package.json")) as
      | Record<string, any>
      | undefined
    assert(pkg, "couldn't find package.json")

    const ext = this.options.useTs ? "tsx" : "js"

    const type = this.options.form
    switch (type) {
      case "finalform":
        pkg.dependencies["final-form"] = "4.x"
        pkg.dependencies["react-final-form"] = "6.x"
        break
      case "hookform":
        pkg.dependencies["react-hook-form"] = "7.x"
        pkg.dependencies["@hookform/resolvers"] = "2.x"
        break
      case "formik":
        pkg.dependencies["formik"] = "2.x"
        break
    }
    this.fs.move(
      this.destinationPath(`_forms/${type}/Form.${ext}`),
      this.destinationPath(`app/core/components/Form.${ext}`),
    )
    this.fs.move(
      this.destinationPath(`_forms/${type}/LabeledTextField.${ext}`),
      this.destinationPath(`app/core/components/LabeledTextField.${ext}`),
    )

    this.fs.writeJSON(this.destinationPath("package.json"), pkg)
    this.fs.delete(this.destinationPath("_forms"))
  }

  private get pkgManager(): PkgManager {
    if (this.options.pnpm) {
      return "pnpm"
    } else if (this.options.yarn) {
      return "yarn"
    } else {
      return "npm"
    }
  }
}
