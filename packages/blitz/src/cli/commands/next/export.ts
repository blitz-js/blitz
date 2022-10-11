import arg from "arg"
import {resolve} from "path"
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
  Exports your Blitz app as a static application. Make sure to run "blitz build" before!

Usage
  $ blitz export [options] <dir>

<dir> represents the directory of the Blitz.js application. If no directory is provided, the current directory will be used.

Options
  --help -h — help
  -o — set the output dir (default: '/out')
      `)

      process.exit(0)
    }
  }

  await getHelp()
  await import("../../utils/next-commands").then((i) => i.blitzExport(config))
}

export {nextExport}
