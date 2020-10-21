
import {Command, flags} from "@oclif/command"
import {PromptAbortedError} from "../errors/prompt-aborted"
import {build as ServerBuild} from "@blitzjs/server"

export class Build extends Command {
  static description = "Creates a production build"
  static aliases = ["b"]

  static flags = {
    help: flags.help({char: "h"}),
  }

  async run() {
    const config = {
      rootFolder: process.cwd(),
    }
    this.parse(Build)

    try {
      const build: typeof ServerBuild = require("@blitzjs/server").build
      await build(config)
    } catch (err) {
      if (err instanceof PromptAbortedError) this.exit(0)
      this.error(err)
    }
  }
}
