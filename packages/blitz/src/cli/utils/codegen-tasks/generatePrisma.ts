import {log} from "../../../logging"
import {runPrisma} from "../../../utils/run-prisma"
import {getPackageJson} from "../get-package-json"

export const generatePrismaClient = async () => {
  const {dependencies, devDependencies} = await getPackageJson()
  const hasPrisma = Object.keys({...dependencies, ...devDependencies}).some(
    (name) => name === "prisma",
  )

  if (hasPrisma) {
    let prismaSpinner = log.spinner(`Generating Prisma client`).start()
    const result = await runPrisma(["generate"], true)
    if (result.success) {
      prismaSpinner.succeed(log.greenText("Generated Prisma client"))
    } else {
      prismaSpinner.fail()
      console.log("\n" + result.stderr)
      process.exit(1)
    }
  }
}
