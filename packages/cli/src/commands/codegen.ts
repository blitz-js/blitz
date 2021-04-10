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
