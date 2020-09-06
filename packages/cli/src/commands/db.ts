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
import pEvent from "p-event"

const getPrismaBin = () => resolveBinAsync("@prisma/cli", "prisma")
let prismaBin: string
let schemaArg: string

const runPrisma = async (args: string[], silent = false) => {
  if (!prismaBin) {
    try {
      prismaBin = await getPrismaBin()
    } catch {
      throw new Error(
        "Oops, we can't find Prisma Client. Please make sure it's installed in your project",
      )
    }
  }

  const cp = spawn(prismaBin, args, {
    stdio: silent ? "ignore" : "inherit",
    env: process.env,
  })
  const code = await pEvent(cp, "exit", {rejectionEvents: []})

  return code === 0
}

const runPrismaExitOnError = async (...args: Parameters<typeof runPrisma>) => {
  const success = await runPrisma(...args)

  if (!success) {
    process.exit(1)
  }
}

// Prisma client generation will fail if no model is defined in the schema.
// So the silent option is here to ignore that failure
export const runPrismaGeneration = async ({silent = false, failSilently = false} = {}) => {
  const success = await runPrisma(["generate", schemaArg], silent)

  if (!success && !failSilently) {
    throw new Error("Prisma Client generation failed")
  }
}

const runMigrateUp = async ({silent = false} = {}) => {
  const args = ["migrate", "up", schemaArg, "--create-db", "--experimental"]

  if (process.env.NODE_ENV === "production" || silent) {
    args.push("--auto-approve")
  }

  const success = await runPrisma(args, silent)

  if (!success) {
    throw new Error("Migration failed")
  }

  return runPrismaGeneration({silent})
}

export const runMigrate = async (flags: object = {}) => {
  if (process.env.NODE_ENV === "production") {
    return runMigrateUp()
  }
  // @ts-ignore escape:TS7053
  const formatFlags = Object.keys(flags).map(key => [`--${key}`, flags[key]])
  const options = formatFlags as unknown as string[]

  const silent = options.includes('name')

  const args = ["migrate", "save", schemaArg, "--create-db", "--experimental", ...options]

  const success = await runPrisma(args, silent)

  if (!success) {
    throw new Error("Migration failed")
  }

  return runMigrateUp({silent})
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
  const dbPath: string = connectionString.replace(/^file:/, "").replace(/^(?:\.\.[\\/])+/, "")
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
    // Used by `new` command to perform the initial migration
    name: flags.string({hidden: true}),
  }

  static strict = false

  async run() {
    const {args, flags} = this.parse(Db)
    const command = args["command"]

    // Needs to happen at run-time since the `new` command needs to change the cwd before running
    const schemaPath = path.join(process.cwd(), "db", "schema.prisma")
    schemaArg = `--schema=${schemaPath}`

    if (command === "migrate" || command === "m") {
      try {
        return await runMigrate(flags)
      } catch (error) {
        if (Object.keys(flags).length > 0) {
          throw error
        } else {
          process.exit(1)
        }
      }
    }

    if (command === "introspect") {
      await runPrismaExitOnError(["introspect", schemaArg])
      return runPrismaExitOnError(["generate", schemaArg])
    }

    if (command === "studio") {
      return runPrismaExitOnError(["studio", schemaArg, "--experimental"])
    }

    if (command === "reset") {
      const spinner = log.spinner("Loading your database").start()
      await runPrismaGeneration({silent: true, failSilently: true})
      spinner.succeed()

      const {confirm} = await prompt<{confirm: string}>({
        type: "confirm",
        name: "confirm",
        message: "Are you sure you want to reset your database and erase ALL data?",
      })

      if (!confirm) {
        return
      }

      const prismaClientPath = require.resolve("@prisma/client", {paths: [projectRoot]})
      const {PrismaClient} = require(prismaClientPath)
      const db = new PrismaClient()
      const dataSource: any = db.engine.datasources[0]
      const providerType: string = dataSource.name
      const connectionString: string = dataSource.url

      if (providerType === "postgresql") {
        resetPostgres(connectionString, db)
      } else if (providerType === "mysql") {
        resetMysql(connectionString, db)
      } else if (providerType === "sqlite") {
        resetSqlite(connectionString)
      } else {
        this.log("Could not find a valid database configuration")
      }

      return
    }

    if (command === "help") {
      return Db.run(["--help"])
    }

    this.log("\nUh oh, Blitz does not support that command.")
    this.log("You can try running a prisma command directly with:")
    this.log("\n  `npm run prisma COMMAND` or `yarn prisma COMMAND`\n")
    this.log("Or you can list available db commands with with:")
    this.log("\n  `npm run blitz db --help` or `yarn blitz db --help`\n")
  }
}
