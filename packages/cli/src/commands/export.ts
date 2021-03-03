import {Command, flags} from "@oclif/command"
import {ServerConfig} from "@blitzjs/server"

export class Export extends Command {
  static description = "Exports a static page"
  static aliases = ["e"]

  static flags = {
    help: flags.help({char: "h"}),
  }

  async run() {
    const config: ServerConfig = {
      rootFolder: process.cwd(),
      env: "prod",
    }
    this.parse(Export)

    try {
      const {blitzExport} = await import("@blitzjs/server")
      await blitzExport(config)
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
