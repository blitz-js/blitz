import {Command, flags} from "@oclif/command"
import {log} from "next/dist/server/lib/logging"
import {getPackageJson} from "../utils/get-package-json"
import {runPrisma} from "./prisma"

export class CodeGen extends Command {
  static description = "Generates Routes Manifest"
  static aliases = ["cg"]

  static flags = {
    help: flags.help({char: "h"}),
    env: flags.string({
      char: "e",
      description: "Set app environment name",
    }),
  }

  async run() {
    this.parse(CodeGen)

    try {
      let routeSpinner = log.spinner(`Generating route manifest`).start()
      const {loadConfigProduction} = await import("next/dist/server/config-shared")
      const {saveRouteManifest} = await import("next/dist/build/routes")
      const config = loadConfigProduction(process.cwd())
      void saveRouteManifest(process.cwd(), config).then(() => routeSpinner.succeed())

      const {dependencies, devDependencies, prisma} = await getPackageJson()

      const hasPrisma = Object.keys({...dependencies, ...devDependencies}).some(
        (name) => name === "prisma",
      )
      const hasPrismaSchema = !!prisma?.schema

      if (hasPrisma && hasPrismaSchema) {
        let prismaSpinner = log.spinner(`Generating Prisma client`).start()
        void runPrisma(["generate"], true).then((result) => {
          if (result.success) {
            prismaSpinner.succeed()
          } else {
            prismaSpinner.fail()
            console.log("\n" + result.stderr)
            process.exit(1)
          }
        })
      }
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}
