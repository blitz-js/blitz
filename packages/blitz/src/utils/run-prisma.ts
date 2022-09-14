import which from "npm-which"
import pEvent from "p-event"
import {Readable} from "stream"
import {spawn} from "cross-spawn"

export const runPrisma = async (args: string[], silent = false) => {
  const prismaBin = which(process.cwd()).sync("prisma")

  const cp = spawn(prismaBin, args, {
    stdio: silent ? "pipe" : "inherit",
    env: process.env,
  })

  const cp_stderr: string[] = []
  if (silent) {
    cp?.stderr?.on("data", (chunk: Readable) => {
      cp_stderr.push(chunk.toString())
    })
  }

  const code = await pEvent(cp, "exit", {rejectionEvents: []})

  return {
    success: code === 0,
    stderr: silent ? cp_stderr.join("") : undefined,
  }
}
