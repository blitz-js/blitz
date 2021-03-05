import {Command, flags} from "@oclif/command"
import {ServerConfig} from "@blitzjs/server"

export class Build extends Command {
  static description = "Creates a production build"
  static aliases = ["b"]

  static flags = {
    help: flags.help({char: "h"}),
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
