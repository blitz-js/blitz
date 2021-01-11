import {Command, flags} from "@oclif/command"
import {log} from "@blitzjs/display"
import {runPrisma, runPrismaExitOnError} from "./prisma"

export function getDbName(connectionString: string): string {
  const dbUrlParts: string[] = connectionString!.split("/")
  const dbName: string = dbUrlParts[dbUrlParts.length - 1]
  return dbName
}

async function runSeed() {
  require("../utils/setup-ts-node").setupTsnode()

  const projectRoot = require("../utils/get-project-root").projectRoot
  const seedPath = require("path").join(projectRoot, "db/seeds")
  const dbPath = require("path").join(projectRoot, "db/index")

  log.branded("Seeding database")
  let spinner = log.spinner("Loading seeds\n").start()

  let seeds: Function | undefined
  try {
    seeds = require(seedPath).default
    if (seeds === undefined) {
      throw new Error(`Cant find default export from db/seeds`)
    }
  } catch (err) {
    log.error(`Couldn't import default from db/seeds.ts or db/seeds/index.ts file`)
    throw err
  }
  spinner.succeed()

  spinner = log.spinner("Checking for database migrations\n").start()
  await runMigrate({}, `--schema=${require("path").join(process.cwd(), "db", "schema.prisma")}`)
  spinner.succeed()

  try {
    console.log(log.withCaret("Seeding..."))
    seeds && (await seeds())
  } catch (err) {
    log.error(err)
    log.error(`Couldn't run imported function, are you sure it's a function?`)
    throw err
  }

  const db = require(dbPath).default
  await db.$disconnect()
  log.success("Done seeding")
}

export class Db extends Command {
  static description = `Run database commands
${require("chalk").bold(
  "seed",
)}   Generates seeded data in database via Prisma 2. You need db/seeds.ts or db/seeds/index.ts.
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
    // Used by `reset` command to skip the confirmation prompt
    force: flags.boolean({char: "f", hidden: true}),
  }

  static strict = false

  async run() {
    const {args, flags} = this.parse(Db)
    const command = args["command"]

    if (command === "help") {
      return Db.run(["--help"])
    }

    if (command === "seed") {
      try {
        return await runSeed()
      } catch (err) {
        log.error("Could not seed database:")
        log.error(err)
        process.exit(1)
      }
    }

    this.log("\nUh oh, Blitz does not support that command.")
    this.log("You can try running a prisma command directly with:")
    this.log("\n  `npm run prisma COMMAND` or `yarn prisma COMMAND`\n")
    this.log("Or you can list available db commands with with:")
    this.log("\n  `npm run blitz db --help` or `yarn blitz db --help`\n")
  }
}
