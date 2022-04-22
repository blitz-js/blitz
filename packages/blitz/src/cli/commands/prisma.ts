import {Readable} from "stream"
import {getCommandBin} from "../utils/config"
import {CliCommand} from "../index"
import arg from "arg"

let prismaBin: string

export const runPrisma = async (args: string[], silent = false) => {
  if (!prismaBin) {
    try {
      prismaBin = await getCommandBin("prisma")
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

const prisma: CliCommand = async () => {
  const args = arg(
    {},
    {
      permissive: true,
    },
  )

  await runPrismaExitOnError(args._.slice(1))
}

export {prisma}
