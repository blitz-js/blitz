import {Command, flags} from "@oclif/command"
import {build} from "@blitzjs/server"
import {runPrismaGeneration} from "./db"

export class Build extends Command {
  static description = "Create a production build"
  static aliases = ["b"]

  async run() {
    const {flags} = this.parse(Build)

    const config = {
      rootFolder: process.cwd(),
    }

    try {
      await build(config, runPrismaGeneration({silent: true}))
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
