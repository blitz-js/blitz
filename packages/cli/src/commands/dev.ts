import {ServerConfig} from "@blitzjs/server"
import {Command, flags} from "@oclif/command"

export class Dev extends Command {
  static description = "Start a development server"
  static aliases = ["d"]

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
    "no-incremental-build": flags.boolean({
      description: "Disable incremental build and start from a fresh cache",
    }),
  }

  async run() {
    const {flags} = this.parse(Dev)

    const config: ServerConfig = {
      rootFolder: process.cwd(),
      port: flags.port,
      hostname: flags.hostname,
      inspect: flags.inspect,
      clean: flags["no-incremental-build"],
      env: "dev",
    }

    try {
      const dev = (await import("@blitzjs/server")).dev
      const {getConfig} = await import("@blitzjs/config")

      const blitzConfig = getConfig()
      if (
        blitzConfig.cli?.clearConsoleOnBlitzDev !== false &&
        !process.env.BLITZ_TEST_ENVIRONMENT
      ) {
        const {log} = await import("@blitzjs/display")
        log.clearConsole()
      }

      await dev(config)
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
