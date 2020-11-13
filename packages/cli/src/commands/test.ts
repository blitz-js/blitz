import {spawn} from "cross-spawn"
import {Command, flags} from "@oclif/command"

export class Test extends Command {
  static description = "Run project tests"
  static aliases = ["t"]

  static args = [
    {
      name: "watch",
      description: "Run test:watch",
    },
  ]

  static flags = {
    help: flags.help({char: "h"}),
  }

  async run() {
    const {args} = this.parse(Test)

    let watchMode: boolean = false
    const watch = args["watch"]
    if (watch) {
      watchMode = watch === "watch" || watch === "w"
    }
    const packageManager = require("has-yarn")() ? "yarn" : "npm"

    if (watchMode) spawn(packageManager, ["test:watch"], {stdio: "inherit"})
    else spawn(packageManager, ["test"], {stdio: "inherit"})
  }
}
