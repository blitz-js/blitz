import {log} from "@blitzjs/display"
import {Command, flags} from "@oclif/command"

export class CodeGen extends Command {
  static description = "Generates Routes Manifest"
  static aliases = ["cg"]

  static flags = {
    help: flags.help({char: "h"}),
  }

  async run() {
    this.parse(CodeGen)

    try {
      let spinner = log.spinner(`Generating route manifest`).start()
      const {loadConfigProduction} = await import("next/dist/server/config-shared")
      const {saveRouteManifest} = await import("next/dist/build/routes")
      const config = loadConfigProduction(process.cwd())
      await saveRouteManifest(process.cwd(), config)
      spinner.succeed()
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}
