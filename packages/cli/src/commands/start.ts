import {ServerConfig} from "@blitzjs/server"
import {Command, flags} from "@oclif/command"

export class Start extends Command {
  static description = "Start the production server"
  static aliases = ["s"]

  static flags = {
    help: flags.help({char: "h"}),
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
    env: flags.string({
      char: "e",
      description: "Set app environment name",
    }),
  }

  async run() {
    const {flags} = this.parse(Start)

    const config: ServerConfig = {
      rootFolder: process.cwd(),
      port: flags.port,
      hostname: flags.hostname,
      inspect: flags.inspect,
      clean: true,
      env: "prod",
    }

    try {
      const prod = (await import("@blitzjs/server")).prod
      await prod(config)
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
