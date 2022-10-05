import arg from "arg"
import {resolve, join} from "path"
import chalk from "chalk"
import {CliCommand} from "../../index"
import {ServerConfig} from "../../utils/config"

const nextExport: CliCommand = async () => {
  const nextArgs = arg(
    {
      // Types
      "--help": Boolean,
      "--outdir": String,

      // Aliases
      "-h": "--help",
      "-o": "--outdir",
    },
    {
      permissive: true,
    },
  )

  const config: ServerConfig = {
    rootFolder: process.cwd(),
    ...(nextArgs["--outdir"] && {outdir: resolve(nextArgs["--outdir"])}),
    env: process.env.NODE_ENV === "production" ? "prod" : "dev",
  }

  const getHelp = async () => {
    if (nextArgs["--help"]) {
      console.log(`
        Description
          Exports the application for production deployment
        Usage
          $ next export [options] <dir>
        <dir> represents the directory of the Blitz.js application.
        If no directory is provided, the current directory will be used.
        Options
          -h - list this help
          -o - set the output dir (defaults to 'out')
      `)

      process.exit(0)
    }
  }

  await getHelp()
  await import("../../utils/next-commands").then((i) => i.blitzExport(config))
}

export {nextExport}
