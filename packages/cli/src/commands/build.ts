import {ServerConfig} from "@blitzjs/server"
import {Command, flags} from "@oclif/command"

export class Build extends Command {
  static description = "Creates a production build"
  static aliases = ["b"]

  static flags = {
    help: flags.help({char: "h"}),
    env: flags.string({
      char: "e",
      description: "Set app environment name",
    }),
  }

  async run() {
    const config: ServerConfig = {
      rootFolder: process.cwd(),
      env: "prod",
    }
    this.parse(Build)

    try {
      const {build} = await import("@blitzjs/server")
      await build(config)
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
