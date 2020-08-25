import {dev, prod} from "@blitzjs/server"
import {Command, flags} from "@oclif/command"
import fs from "fs"
import path from "path"
import pkgDir from "pkg-dir"
import {runPrismaGeneration} from "./db"

const projectRoot = pkgDir.sync() || process.cwd()
const isTypescript = fs.existsSync(path.join(projectRoot, "tsconfig.json"))

export class Start extends Command {
  static description = "Start a development server"
  static aliases = ["s"]

  static flags = {
    production: flags.boolean({
      description: "Create and start a production server",
    }),
    port: flags.integer({
      char: "p",
      description: "Set port number",
    }),
    hostname: flags.string({
      char: "H",
      description: "Set server hostname",
    }),
  }

  async run() {
    
    const {flags} = this.parse(Start)

    const config = {
      rootFolder: process.cwd(),
      port: flags.port,
      hostname: flags.hostname,
      isTypescript,
    }

    try {
      if (flags.production) {
        await prod(config, runPrismaGeneration({silent: true}))
      } else {
        await dev(config, runPrismaGeneration({silent: true}))
      }
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
