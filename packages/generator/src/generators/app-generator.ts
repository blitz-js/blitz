import {Generator, GeneratorOptions} from "../generator"
import spawn from "cross-spawn"
import chalk from "chalk"
import username from "username"
import {readJSONSync, writeJson} from "fs-extra"
import {resolve, join} from "path"
import {fetchLatestVersionsFor} from "../utils/fetch-latest-version-for"
import {log} from "@blitzjs/display"
import {getBlitzDependencyVersion} from "../utils/get-blitz-dependency-version"

export interface AppGeneratorOptions extends GeneratorOptions {
  appName: string
  useTs: boolean
  yarn: boolean
  version: string
  skipInstall: boolean
  skipGit: boolean
  form: "React Final Form" | "React Hook Form" | "Formik"
}

export class AppGenerator extends Generator<AppGeneratorOptions> {
  sourceRoot: string = resolve(__dirname, "./templates/app")
  // Disable file-level prettier because we manually run prettier at the end
  prettierDisabled = true

  filesToIgnore() {
    if (!this.options.useTs) {
      return ["tsconfig.json"]
    }
    return ["jsconfig.json"]
  }

  async getTemplateValues() {
    return {
      name: this.options.appName,
      username: await username(),
    }
  }

  getTargetDirectory() {
    return ""
  }

  // eslint-disable-next-line require-await
  async preCommit() {
    this.fs.move(this.destinationPath("gitignore"), this.destinationPath(".gitignore"))
    const pkg = this.fs.readJSON(this.destinationPath("package.json"))

    switch (this.options.form) {
      case "React Final Form":
        this.fs.move(
          this.destinationPath("_forms/finalform/Form.tsx"),
          this.destinationPath("app/components/Form.tsx"),
        )
        this.fs.move(
          this.destinationPath("_forms/finalform/LabeledTextField.tsx"),
          this.destinationPath("app/components/LabeledTextField.tsx"),
        )
        pkg.dependencies["final-form"] = "4.x"
        pkg.dependencies["react-final-form"] = "6.x"
        break
      case "React Hook Form":
        this.fs.move(
          this.destinationPath("_forms/hookform/Form.tsx"),
          this.destinationPath("app/components/Form.tsx"),
        )
        this.fs.move(
          this.destinationPath("_forms/hookform/LabeledTextField.tsx"),
          this.destinationPath("app/components/LabeledTextField.tsx"),
        )
        pkg.dependencies["react-hook-form"] = "6.x"
        break
      case "Formik":
        this.fs.move(
          this.destinationPath("_forms/formik/Form.tsx"),
          this.destinationPath("app/components/Form.tsx"),
        )
        this.fs.move(
          this.destinationPath("_forms/formik/LabeledTextField.tsx"),
          this.destinationPath("app/components/LabeledTextField.tsx"),
        )
        pkg.dependencies["formik"] = "2.x"
        break
    }
    this.fs.delete(this.destinationPath("_forms"))

    this.fs.writeJSON(this.destinationPath("package.json"), pkg)
  }

  async postWrite() {
    let gitInitSuccessful
    if (!this.options.skipGit) {
      const initResult = spawn.sync("git", ["init"], {
        stdio: "ignore",
      })

      gitInitSuccessful = initResult.status !== 0
      if (!gitInitSuccessful) {
        log.warning("Failed to run git init.")
        log.warning("Find out more about how to install git here: https://git-scm.com/downloads.")
      }
    }
    const pkgJsonLocation = join(this.destinationPath(), "package.json")
    const pkg = readJSONSync(pkgJsonLocation)

    console.log("") // New line needed
    const spinner = log.spinner(log.withBrand("Retrieving the freshest of dependencies")).start()

    const [
      {value: newDependencies, isFallback: dependenciesUsedFallback},
      {value: newDevDependencies, isFallback: devDependenciesUsedFallback},
      {value: blitzDependencyVersion, isFallback: blitzUsedFallback},
    ] = await Promise.all([
      fetchLatestVersionsFor(pkg.dependencies),
      fetchLatestVersionsFor(pkg.devDependencies),
      getBlitzDependencyVersion(this.options.version),
    ])

    pkg.dependencies = newDependencies
    pkg.devDependencies = newDevDependencies
    pkg.dependencies.blitz = blitzDependencyVersion

    const fallbackUsed =
      dependenciesUsedFallback || devDependenciesUsedFallback || blitzUsedFallback

    await writeJson(pkgJsonLocation, pkg, {spaces: 2})

    if (!fallbackUsed && !this.options.skipInstall) {
      spinner.succeed()

      await new Promise((resolve) => {
        const logFlag = this.options.yarn ? "--json" : "--loglevel=error"
        const cp = spawn(this.options.yarn ? "yarn" : "npm", ["install", logFlag], {
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

        if (!this.options.yarn) {
          const spinner = log
            .spinner(log.withBrand("Installing those dependencies (this will take a few minutes)"))
            .start()
          spinners.push(spinner)
        }

        cp.stdout?.setEncoding("utf8")
        cp.stderr?.setEncoding("utf8")
        cp.stdout?.on("data", (data) => {
          if (this.options.yarn) {
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
          if (this.options.yarn) {
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
          if (!this.options.yarn && spinners[spinners.length - 1].isSpinning) {
            if (code !== 0) spinners[spinners.length - 1].fail()
            else {
              spinners[spinners.length - 1].succeed()
            }
          }
          resolve()
        })
      })

      const runLocalNodeCLI = (command: string) => {
        if (this.options.yarn) {
          return spawn.sync("yarn", ["run", ...command.split(" ")])
        } else {
          return spawn.sync("npx", command.split(" "))
        }
      }

      // Ensure the generated files are formatted with the installed prettier version
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
    } else {
      console.log("") // New line needed
      spinner.fail(
        chalk.red.bold(
          `We had some trouble connecting to the network, so we'll skip installing your dependencies right now. Make sure to run ${
            this.options.yarn ? "'yarn'" : "'npm install'"
          } once you're connected again.`,
        ),
      )
    }

    if (!this.options.skipGit && gitInitSuccessful) {
      this.commitChanges()
    }
  }

  commitChanges() {
    const commitSpinner = log.spinner(log.withBrand("Committing your app")).start()
    const commands: Array<[string, string[], object]> = [
      ["git", ["add", "."], {stdio: "ignore"}],
      [
        "git",
        ["commit", "--no-gpg-sign", "-m", "New baby Blitz app!"],
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
}
