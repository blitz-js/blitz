import {Command, flags} from "@oclif/command"
import {log} from "@blitzjs/display"

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

export class Seed extends Command {
  static description = `Generates seeded data in database. You need db/seeds.ts or db/seeds/index.ts.`

  static flags = {
    help: flags.help({char: "h"}),
    // Used by `reset` command to skip the confirmation prompt
    force: flags.boolean({char: "f", hidden: true}),
  }

  static strict = false

  async run() {
    this.parse(Seed)
    try {
      return await runSeed()
    } catch (err) {
      log.error("Could not seed database:")
      log.error(err)
      process.exit(1)
    }
  }
}
