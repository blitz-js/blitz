import {Command} from "@oclif/config"
import Help from "@oclif/plugin-help"
import chalk from "chalk"
import {indent} from "./utils/indent"

// eslint-disable-next-line import/no-default-export
export default class BlitzHelp extends Help {
  protected formatCommands(commands: Command[]): string {
    const body = commands
      .map((command) => {
        let output = ""
        output += command.id
        const joinedAliases = command.aliases.join(", ")
        if (joinedAliases) output += `, ${joinedAliases}`
        output = output.padEnd(15, " ")
        if (command.description) output += command.description.split("\n")[0]
        return output
      })
      .join("\n")

    return [chalk.bold("COMMANDS"), indent(body, 2)].join("\n")
  }
}
