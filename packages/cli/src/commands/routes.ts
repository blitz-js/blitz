import {Command, flags} from "@oclif/command"
import {routes as ServerRoutes, ServerConfig} from "@blitzjs/server"
import {log, table as Table} from "@blitzjs/display"

export class Routes extends Command {
  static description = "Output Blitz Routes"
  static aliases = ["r"]

  static flags = {
    help: flags.help({char: "h"}),
  }

  getColor(type: string) {
    switch (type) {
      case "rpc":
        return "cyan"
      case "api":
        return "magenta"
      default:
        return "white"
    }
  }

  async run() {
    const config: ServerConfig = {
      rootFolder: process.cwd(),
    }
    this.parse(Routes)

    try {
      let spinner = log.spinner(`Populating routes cache`).start()
      const routes: typeof ServerRoutes = require("@blitzjs/server").routes
      const routesResult = await routes(config)
      spinner.stop()
      log.newline()
      const table = new Table({
        columns: [
          {name: "Verb", alignment: "center"},
          {name: "Relative Path", alignment: "left"},
          {name: "URI", alignment: "left"},
          {name: "Type", alignment: "center"},
        ],
        sort: (q, r) => {
          if (q.Type > r.Type) {
            return 1
          }
          if (q.Type < r.Type) {
            return -1
          }
          return 0
        },
      })
      routesResult.forEach(({path, uri, verb, type}: any) => {
        table.addRow(
          {Verb: verb.toUpperCase(), "Relative Path": path, URI: uri, Type: type.toUpperCase()},
          {color: this.getColor(type)},
        )
      })
      log.info(table.render())
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}
