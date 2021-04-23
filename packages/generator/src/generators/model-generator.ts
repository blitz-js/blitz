import {log} from "@blitzjs/display"
import {spawn} from "cross-spawn"
import which from "npm-which"
import path from "path"
import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {Field} from "../prisma/field"
import {Model} from "../prisma/model"
import {matchBetween} from "../utils/match-between"

export interface ModelGeneratorOptions extends GeneratorOptions {
  modelName: string
  extraArgs: string[]
}

export class ModelGenerator extends Generator<ModelGeneratorOptions> {
  // default subdirectory is /app/[name], we need to back out of there to generate the model
  static subdirectory = "../.."
  sourceRoot: SourceRootType = {type: "absolute", path: ""}
  unsafe_disableConflictChecker = true

  async getTemplateValues() {}

  getTargetDirectory() {
    return ""
  }

  async prismaMigratePrompt() {
    const response: any = await this.enquirer.prompt({
      name: "migrate",
      type: "confirm",
      message: "Run 'prisma migrate dev' to update your database?",
      initial: "y",
    })
    return response.migrate === true
  }

  // eslint-disable-next-line require-await
  async write() {
    try {
      if (!this.fs.exists(path.resolve("db/schema.prisma"))) {
        throw new Error("Prisma schema file was not found")
      }
      let updatedOrCreated = "created"

      const extraArgs =
        this.options.extraArgs.length === 1 && this.options.extraArgs[0].includes(" ")
          ? this.options.extraArgs[0].split(" ")
          : this.options.extraArgs
      const modelDefinition = new Model(
        this.options.modelName,
        extraArgs.flatMap((def) => Field.parse(def)),
      )
      if (!this.options.dryRun) {
        // wrap in newlines to put a space below the previously generated model and
        // to preserve the EOF newline
        const schema = this.fs.read(path.resolve("db/schema.prisma"))

        if (schema.indexOf(`model ${modelDefinition.name}`) === -1) {
          //model does not exist in schema - just add it
          this.fs.append(path.resolve("db/schema.prisma"), `\n${modelDefinition.toString()}\n`)
        } else {
          const model = matchBetween(schema, `model ${modelDefinition.name}`, "}")
          if (model) {
            //filter out all fields that are already defined
            modelDefinition.fields = modelDefinition.fields.filter((field) => {
              return model.indexOf(field.name) === -1
            })

            //add new fields to the selected model
            const newModel = model.replace("}", `${modelDefinition.getNewFields()}}`)

            //replace all content with the newly added fields for the already existing model
            this.fs.write(path.resolve("db/schema.prisma"), schema.replace(model, newModel))
            updatedOrCreated = "updated"
          }
        }
      }
      log.newline()
      log.success(
        `Model for '${this.options.modelName}'${
          this.options.dryRun ? "" : ` ${updatedOrCreated} in schema.prisma`
        }:\n`,
      )
      modelDefinition.toString().split("\n").map(log.progress)
      log.newline()
    } catch (error) {
      throw error
    }
  }

  async postWrite() {
    const shouldMigrate = await this.prismaMigratePrompt()
    if (shouldMigrate) {
      await new Promise<void>((res, rej) => {
        const prismaBin = which(process.cwd()).sync("prisma")
        const child = spawn(prismaBin, ["migrate", "dev"], {stdio: "inherit"})
        child.on("exit", (code) => (code === 0 ? res() : rej()))
      })
    }
  }
}
