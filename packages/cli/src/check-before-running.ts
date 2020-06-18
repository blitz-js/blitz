import {Hook} from "@oclif/config"
import chalk from "chalk"

import {isBlitzRoot, IsBlitzRootError} from "./utils/is-blitz-root"

const whitelistGlobal = ["-h", "--help", "help", "new"]

export const hook: Hook<"init"> = async function (options) {
  const {id} = options
  if (id && whitelistGlobal.includes(id)) return

  const {err, message, depth} = await isBlitzRoot()

  if (err) {
    switch (message) {
      case IsBlitzRootError.NotBlitz:
        return this.error(
          `You are not inside a Blitz project, so this command won't work.\nYou can create a new app with ${chalk.bold(
            "blitz new myapp",
          )} or see help with ${chalk.bold("blitz help")}`,
        )
      case IsBlitzRootError.NotRoot:
        const help = depth
          ? `\nUse ${chalk.bold("cd " + "../".repeat(depth))} to get to the root of your project`
          : ""

        return this.error(
          `You are currently in a sub-folder of your Blitz app, but this command must be used from the root of your project.${help}`,
        )
      case IsBlitzRootError.BadPackageJson:
        return this.error(`Reading package.json file`)
      default:
        return this.error(`An error occurred`)
    }
  }
}
