import {Command, flags} from "@oclif/command"
import {Readable} from "stream"

const getPrismaBin = async () => {
  let bin: any
  try {
    bin = require("@blitzjs/server").resolveBinAsync("prisma", "prisma")
  } catch {
    // legacy compatability
    bin = require("@blitzjs/server").resolveBinAsync("@prisma/cli", "prisma")
  }
  return bin
}

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
    stdio: silent ? "pipe" : "inherit",
    env: process.env,
  })

  const cp_stderr: string[] = []
  if (silent) {
    cp.stderr.on("data", (chunk: Readable) => {
      cp_stderr.push(chunk.toString())
    })
  }

  const code = await require("p-event")(cp, "exit", {rejectionEvents: []})

  return {
    success: code === 0,
    stderr: silent ? cp_stderr.join("") : undefined,
  }
}

export const runPrismaExitOnError = async (...args: Parameters<typeof runPrisma>) => {
  const result = await runPrisma(...args)

  if (!result.success) {
    process.exit(1)
  }
}

export class PrismaCommand extends Command {
  static description = "Loads env variables then proxies all args to Prisma CLI"
  static aliases = ["p"]

  static flags = {
    env: flags.string({
      char: "e",
      description: "Set app environment name",
    }),
  }

  static strict = false

  async run() {
    const {argv} = this.parse(PrismaCommand)

    await runPrismaExitOnError(argv)
  }
}
