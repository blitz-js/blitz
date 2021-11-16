import {log} from "@blitzjs/display"
import {Command, flags} from "@oclif/command"
import {baseLogger} from "next/dist/server/lib/logging"

export function getDbName(connectionString: string): string {
  const dbUrlParts: string[] = connectionString!.split("/")
  const dbName: string = dbUrlParts[dbUrlParts.length - 1]
  return dbName
}

async function runSeed(seedBasePath: string) {
  require("../utils/setup-ts-node").setupTsnode()

  const projectRoot = require("next/dist/server/lib/utils").getProjectRootSync()
  const seedPath = require("path").join(projectRoot, seedBasePath)
  const dbPath = require("path").join(projectRoot, "db/index")

  log.branded("Seeding database")
  let spinner = log.spinner("Loading seeds\n").start()

  let seeds: Function | undefined
  try {
    seeds = require(seedPath).default
    if (seeds === undefined) {
      throw new Error(`Couldn't find default export from ${seedBasePath}`)
    }
  } catch (err) {
    log.error(`Couldn't import default from ${seedBasePath}`)
    throw err
  }
  spinner.succeed()

  try {
    console.log("\n" + log.withCaret("Seeding..."))
    seeds && (await seeds())
  } catch (err) {
    baseLogger().prettyError(err as any)
    log.error(`Couldn't run imported function, are you sure it's a function?`)
    throw err
  }

  const db = require(dbPath).default
  await db.$disconnect()
  log.success("Done seeding")
}

export interface Flags {
  file: boolean
}

export class Db extends Command {
  static description = `Run database commands
${require("chalk").bold("seed")}   Generates seeded data in database via Prisma.
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
    file: flags.string({
      default: "db/seeds",
      char: "f",
      description: `Path to the seeds file, relative to the project root folder. Examples: db/seeds, db/seeds.ts, db/seeds/index.ts, db/my-seeds`,
    }),
  }

  static strict = false

  async run() {
    process.env.CLI_COMMAND_DB = "true"
    const {args, flags} = this.parse(Db)
    const command = args["command"]

    if (command === "help") {
      return Db.run(["--help"])
    }

    if (command === "seed") {
      try {
        return await runSeed(flags.file)
      } catch (err) {
        log.error("Could not seed database:")
        baseLogger().prettyError(err as any)
        process.exit(1)
      }
    }

    this.log("\nThat command is no longer available..")
    this.log("For any prisma related commands, use the `blitz prisma` command instead:")
    this.log("\n  `blitz prisma COMMAND`\n")
  }
}
