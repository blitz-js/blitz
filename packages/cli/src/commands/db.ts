import {resolveBinAsync} from "@blitzjs/server"
import {log} from "@blitzjs/display"
import {Command, flags} from "@oclif/command"
import chalk from "chalk"
import {spawn} from "cross-spawn"
import {prompt} from "enquirer"
import * as fs from "fs"
import * as path from "path"
import {promisify} from "util"
import {projectRoot} from "../utils/get-project-root"

const schemaPath = path.join(process.cwd(), "db", "schema.prisma")
const schemaArg = `--schema=${schemaPath}`
const getPrismaBin = () => resolveBinAsync("@prisma/cli", "prisma")

// Prisma client generation will fail if no model is defined in the schema.
// So the silent option is here to ignore that failure
export const runPrismaGeneration = async ({silent = false} = {}) => {
  try {
    const prismaBin = await getPrismaBin()

    return new Promise((resolve) => {
      spawn(prismaBin, ["generate", schemaArg], {stdio: silent ? "ignore" : "inherit"}).on(
        "exit",
        (code) => {
          if (code === 0) {
            resolve()
          } else if (silent) {
            resolve()
          } else {
            process.exit(1)
          }
        },
      )
    })
  } catch (error) {
    if (silent) return
    throw new Error(
      "Oops, we can't find Prisma Client. Please make sure it's installed in your project",
    )
  }
}

const runMigrateUp = (prismaBin: string, resolve: (value?: unknown) => void) => {
  const cp = spawn(prismaBin, ["migrate", "up", schemaArg, "--create-db", "--experimental"], {
    stdio: "inherit",
  })
  cp.on("exit", async (code) => {
    if (code === 0) {
      await runPrismaGeneration()
      resolve()
    } else {
      process.exit(1)
    }
  })
}

export const runMigrate = async () => {
  const prismaBin = await getPrismaBin()
  return new Promise((resolve) => {
    if (process.env.NODE_ENV === "production") {
      runMigrateUp(prismaBin, resolve)
    } else {
      const cp = spawn(prismaBin, ["migrate", "save", schemaArg, "--create-db", "--experimental"], {
        stdio: "inherit",
      })
      cp.on("exit", (code) => {
        if (code === 0) {
          runMigrateUp(prismaBin, resolve)
        } else {
          process.exit(1)
        }
      })
    }
  })
}

export async function resetPostgres(connectionString: string, db: any): Promise<void> {
  const dbName: string = getDbName(connectionString)
  try {
    // close all other connections
    await db.queryRaw(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname='${dbName};'`,
    )
    // currently assuming the public schema is being used
    // delete schema and recreate with the appropriate privileges
    await db.executeRaw("DROP SCHEMA public cascade;")
    await db.executeRaw("CREATE SCHEMA public;")
    await db.executeRaw("GRANT ALL ON schema public TO postgres;")
    await db.executeRaw("GRANT ALL ON schema public TO public;")
    // run migration
    await runMigrate()
    log.success("Your database has been reset.")
    process.exit(0)
  } catch (err) {
    log.error(`Resetting the database has failed with an error from the database: `)
    log.error(err)
    process.exit(1)
  }
}

export async function resetMysql(connectionString: string, db: any): Promise<void> {
  const dbName: string = getDbName(connectionString)
  try {
    // delete database
    await db.executeRaw(`DROP DATABASE \`${dbName}\``)
    // run migration
    await runMigrate()
    log.success("Your database has been reset.")
    process.exit(0)
  } catch (err) {
    log.error(`Resetting the database has failed with an error from the database: `)
    log.error(err)
    process.exit(1)
  }
}

export async function resetSqlite(connectionString: string): Promise<void> {
  const dbPath: string = connectionString.replace(/^(?:\.\.[\\/])+/, "")
  const unlink = promisify(fs.unlink)
  try {
    // delete database from folder
    await unlink(dbPath)
    // run migration
    await runMigrate()
    log.success("Your database has been reset.")
    process.exit(0)
  } catch (err) {
    log.error(`Resetting the database has failed with an error from the file system: `)
    log.error(err)
    process.exit(1)
  }
}

export function getDbName(connectionString: string): string {
  const dbUrlParts: string[] = connectionString!.split("/")
  const dbName: string = dbUrlParts[dbUrlParts.length - 1]
  return dbName
}

export class Db extends Command {
  static description = `Run database commands

${chalk.bold("migrate")}   Run any needed migrations via Prisma 2 and generate Prisma Client.

${chalk.bold(
  "introspect",
)}   Will introspect the database defined in db/schema.prisma and automatically generate a complete schema.prisma file for you. Lastly, it'll generate Prisma Client.

${chalk.bold(
  "studio",
)}   Open the Prisma Studio UI at http://localhost:5555 so you can easily see and change data in your database.

${chalk.bold("reset")}   Reset the database and run a fresh migration via Prisma 2.
`

  static args = [
    {
      name: "command",
      description: "Run specific db command",
      required: true,
      default: "help",
    },
  ]

  static flags = {
    help: flags.help({char: "h"}),
  }

  async run() {
    const {args} = this.parse(Db)
    const command = args["command"]

    const prismaBin = await getPrismaBin()

    if (command === "migrate" || command === "m") {
      await runMigrate()
    } else if (command === "introspect") {
      const cp = spawn(prismaBin, ["introspect", schemaArg], {
        stdio: "inherit",
      })
      cp.on("exit", (code) => {
        if (code === 0) {
          spawn(prismaBin, ["generate", schemaArg], {stdio: "inherit"}).on(
            "exit",
            (code: number) => {
              if (code !== 0) {
                process.exit(1)
              }
            },
          )
        } else {
          process.exit(1)
        }
      })
    } else if (command === "studio") {
      const cp = spawn(prismaBin, ["studio", schemaArg, "--experimental"], {
        stdio: "inherit",
      })
      cp.on("exit", (code) => {
        if (code === 0) {
        } else {
          process.exit(1)
        }
      })
    } else if (command === "reset") {
      const spinner = log.spinner("Loading your database").start()
      await runPrismaGeneration({silent: true})
      spinner.succeed()
      await prompt<{confirm: string}>({
        type: "confirm",
        name: "confirm",
        message: "Are you sure you want to reset your database and erase ALL data?",
      }).then((res) => {
        if (res.confirm) {
          const prismaClientPath = require.resolve("@prisma/client", {paths: [projectRoot]})
          const {PrismaClient} = require(prismaClientPath)
          const db = new PrismaClient()
          const dataSource: any = db.internalDatasources[0]
          const connectorType: string = dataSource.connectorType
          const connectionString: string = dataSource.url.value
          if (connectorType === "postgresql") {
            resetPostgres(connectionString, db)
          } else if (connectorType === "mysql") {
            resetMysql(connectionString, db)
          } else if (connectorType === "sqlite") {
            resetSqlite(connectionString)
          } else {
            this.log("Could not find a valid database configuration")
          }
        }
      })
    } else if (command === "help") {
      await Db.run(["--help"])
    } else {
      this.log("\nUh oh, Blitz does not support that command.")
      this.log("You can try running a prisma command directly with:")
      this.log("\n  `npm run prisma COMMAND` or `yarn prisma COMMAND`\n")
      this.log("Or you can list available db commands with with:")
      this.log("\n  `npm run blitz db --help` or `yarn blitz db --help`\n")
    }
  }
}
