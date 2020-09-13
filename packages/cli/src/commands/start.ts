import {dev, prod} from "@blitzjs/server"
import {Command, flags} from "@oclif/command"
import {runPrismaGeneration} from "./db"

export class Start extends Command {
  static description = "Start a development server"
  static aliases = ["s"]

  static flags = {
    production: flags.boolean({
      description: "Create and start a production server",
    }),
    port: flags.integer({
      char: "p",
      description: "Set port number",
    }),
    hostname: flags.string({
      char: "H",
      description: "Set server hostname",
    }),
    inspect: flags.boolean({
      description: "Enable the Node.js inspector",
    }),
  }

  async run() {
    const {flags} = this.parse(Start)

    const config = {
      rootFolder: process.cwd(),
      port: flags.port,
      hostname: flags.hostname,
      inspect: flags.inspect,
    }

    try {
      if (flags.production) {
        await prod(config, runPrismaGeneration({silent: true, failSilently: true}))
      } else {
        await dev(config, runPrismaGeneration({silent: true, failSilently: true}))
      }
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
