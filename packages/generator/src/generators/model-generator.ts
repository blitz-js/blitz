import * as ast from "@mrleebo/prisma-ast"
import {spawn} from "cross-spawn"
import which from "npm-which"
import path from "path"
import {log} from "../utils/log"
import {Generator, GeneratorOptions, SourceRootType} from "../generator"
import {Field} from "../prisma/field"
import {Model} from "../prisma/model"
import {getTemplateRoot} from "../utils/get-template-root"

export interface ModelGeneratorOptions extends GeneratorOptions {
  modelName: string
  extraArgs: string[]
}

export class ModelGenerator extends Generator<ModelGeneratorOptions> {
  sourceRoot: SourceRootType
  constructor(options: ModelGeneratorOptions) {
    super(options)
    this.sourceRoot = getTemplateRoot(options.templateDir, {type: "absolute", path: ""})
  }
  // default subdirectory is /app/[name], we need to back out of there to generate the model
  static subdirectory = "../.."
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
    const schemaPath = path.resolve("db/schema.prisma")
    if (!this.fs.exists(schemaPath)) {
      throw new Error("Prisma schema file was not found")
    }

    let schema: ast.Schema
    try {
      schema = ast.getSchema(this.fs.read(schemaPath))
    } catch (err) {
      console.error("Failed to parse db/schema.prisma file")
      throw err
    }
    const {modelName, extraArgs, dryRun} = this.options
    let updatedOrCreated = "created"

    let fields = (
      extraArgs.length === 1 && extraArgs[0]?.includes(" ") ? extraArgs[0]?.split(" ") : extraArgs
    ).flatMap((input) => Field.parse(input, schema))

    const modelDefinition = new Model(modelName, fields)

    let model: ast.Model | undefined
    if (!dryRun) {
      model = schema.list.find(function (component): component is ast.Model {
        return component.type === "model" && component.name === modelDefinition.name
      })
      try {
        if (model) {
          for (const field of fields) field.appendTo(model)
          this.fs.write(schemaPath, ast.printSchema(schema))
          updatedOrCreated = "updated"
        } else {
          model = modelDefinition.appendTo(schema)
          this.fs.write(schemaPath, ast.printSchema(schema))
        }
      } catch (err) {
        console.error(`Failed to apply changes to model '${modelDefinition.name}'`)
        throw err
      }
    }

    if (model) {
      console.log("\n")
      console.log(
        `Model '${modelDefinition.name}'${
          dryRun ? "" : ` ${updatedOrCreated} in schema.prisma`
        }:\n`,
      )
      ast
        .printSchema({type: "schema", list: [model]})
        .split("\n")
        .map(log.progress)
      console.log("\n")
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
