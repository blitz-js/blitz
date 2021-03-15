import {Command, flags} from "@oclif/command"

export class DxGenerate extends Command {
  static description = "Generates Routes Manifest"
  static aliases = ["dxg"]

  static flags = {
    help: flags.help({char: "h"}),
  }

  async run() {
    this.parse(DxGenerate)

    try {
      const {generate} = await import("@blitzjs/server")
      await generate({
        rootFolder: process.cwd(),
        env: "dev",
      })
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}
