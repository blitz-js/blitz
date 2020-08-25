import {Command} from "@oclif/command"
import {join} from "path"
import pkgDir from "pkg-dir"
import {log} from "@blitzjs/display"
import {runMigrate} from "./db"

const projectRoot = pkgDir.sync() || process.cwd()

export class Seed extends Command {
  static description = `Fill database with seed data`

  async run() {
    log.branded("Seeding database")
    let spinner = log.spinner("Loading seeds").start()

    let seeds: Function

    try {
      seeds = require(join(projectRoot, "db/seeds")).default

      if (seeds === undefined) {
        throw new Error(`Cant find default export from db/seeds`)
      }
    } catch (err) {
      log.error(err)
      this.error(`Couldn't import default from db/seeds.ts or db/seeds/index.ts file`)
    }
    spinner.succeed()

    spinner = log.spinner("Checking for database migrations").start()
    await runMigrate()
    spinner.succeed()

    try {
      console.log(log.withCaret("Seeding..."))
      await seeds()
    } catch (err) {
      log.error(err)
      this.error(`Couldn't run imported function, are you sure it's a function?`)
    }

    const db = require(join(projectRoot, "db/index")).default
    await db.disconnect()
    log.success("Done seeding")
  }
}
