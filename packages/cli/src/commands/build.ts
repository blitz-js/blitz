import {ServerConfig} from "@blitzjs/server"
import {Command, flags} from "@oclif/command"

export class Build extends Command {
  static description = "Creates a production build"
  static aliases = ["b"]

  static flags = {
    help: flags.help({char: "h"}),
    environment: flags.string({
      char: "e",
      description: "Set app environment name",
    }),
  }

  async run() {
    const config: ServerConfig = {
      rootFolder: process.cwd(),
      env: "prod",
    }
    const {flags} = this.parse(Build)

    if (flags.environment) {
      process.env.APP_ENV = flags.environment
    }

    try {
      const {build} = await import("@blitzjs/server")
      await build(config)
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
