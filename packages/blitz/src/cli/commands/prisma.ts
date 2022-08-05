import {CliCommand} from "../index"
import arg from "arg"
import {runPrisma} from "../../utils/run-prisma"

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
