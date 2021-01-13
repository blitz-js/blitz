import {Command, flags} from "@oclif/command"

// @blitzjs/server imports react, so we must import the @blitzjs/server version of the
// local app instead of the global.
// import-cwd is required so this works correctly during new app generation
const getPrismaBin = () =>
  require("import-cwd")("@blitzjs/server").resolveBinAsync("@prisma/cli", "prisma")

let prismaBin: string

export const runPrisma = async (args: string[], silent = false) => {
  if (!prismaBin) {
    try {
      prismaBin = await getPrismaBin()
    } catch (err) {
      throw err
    }
  }

  const cp = require("cross-spawn").spawn(prismaBin, args, {
    stdio: silent ? "ignore" : "inherit",
    env: process.env,
  })
  const code = await require("p-event")(cp, "exit", {rejectionEvents: []})

  return code === 0
}

export const runPrismaExitOnError = async (...args: Parameters<typeof runPrisma>) => {
  const success = await runPrisma(...args)

  if (!success) {
    process.exit(1)
  }
}

export class PrismaCommand extends Command {
  static description = "Loads env variables then proxies all args to Prisma CLI"
  static aliases = ["p"]

  static flags = {
    help: flags.help({char: "h"}),
  }

  static strict = false

  async run() {
    const {argv} = this.parse(PrismaCommand)

    await runPrismaExitOnError(argv)
  }
}
