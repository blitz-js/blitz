import {Command} from "@oclif/command"

export class Build extends Command {
  static description = "Create a production build"
  static aliases = ["b"]

  async run() {
    const config = {
      rootFolder: process.cwd(),
    }

    try {
      await require("@blitzjs/server").build(
        config,
        require("./db").runPrismaGeneration({silent: true, failSilently: true}),
      )
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
