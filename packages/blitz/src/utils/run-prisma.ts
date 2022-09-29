import pEvent from "p-event"
import {Readable} from "stream"
import {spawn} from "cross-spawn"
import resolveFrom from "resolve-from"
import {log} from "../logging"

export const runPrisma = async (args: string[], silent = false) => {
  const prismaBin = resolveFrom.silent(process.cwd(), "prisma")

  if (prismaBin) {
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
  } else {
    return {
      success: false,
    }
  }
}
