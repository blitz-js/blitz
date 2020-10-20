import {build as ServerBuild} from "@blitzjs/server"
import {Command} from "@oclif/command"

export class Build extends Command {
  static description = "Create a production build"
  static aliases = ["b"]

  async run() {
    const config = {
      rootFolder: process.cwd(),
    }

    try {
      const build: typeof ServerBuild = require("@blitzjs/server").build
      await build(config)
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
