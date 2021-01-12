import {log} from "@blitzjs/display"
import path from "path"
import {Generator, GeneratorOptions} from "../generator"
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
  sourceRoot: string = ""
  unsafe_disableConflictChecker = true

  async getTemplateValues() {}

  getTargetDirectory() {
    return ""
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
      log.success(
        `Model for '${this.options.modelName}'${
          this.options.dryRun ? "" : ` ${updatedOrCreated} successfully`
        }:\n`,
      )
      modelDefinition.toString().split("\n").map(log.progress)
      log.info(
        "\nNow run " +
          log.variable("blitz prisma migrate deploy --preview-feature") +
          " to add this model to your database\n",
      )
    } catch (error) {
      throw error
    }
  }
}
