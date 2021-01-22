import {Command, flags} from "@oclif/command"
import {ServerConfig} from "@blitzjs/server"
import {log, table as Table} from "@blitzjs/display"

export class Routes extends Command {
  static description = "Display all Blitz URL Routes"
  static aliases = ["r"]

  static flags = {
    help: flags.help({char: "h"}),
  }

  getColor(type: string) {
    switch (type) {
      case "rpc":
        return "magenta"
      case "api":
        return "blue"
      default:
        return "green"
    }
  }

  async run() {
    const config: ServerConfig = {
      rootFolder: process.cwd(),
      env: "dev",
    }
    this.parse(Routes)

    try {
      const {routes} = await import("@blitzjs/server")
      const routesResult = await routes(config)
      log.newline()
      const table = new Table({
        columns: [
          {name: "HTTP", alignment: "center"},
          {name: "Source File", alignment: "left"},
          {name: "URI", alignment: "left"},
          {name: "Type", alignment: "center"},
        ],
        sort: (q, r) => {
          // Sort pages to the top
          if (q.Type === "PAGE" && r.Type !== "PAGE") {
            return -1
          }
          if (q.Type !== "PAGE" && r.Type === "PAGE") {
            return 1
          }

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
          {
            [table.table.columns[0].name]: verb.toUpperCase(),
            [table.table.columns[1].name]: path,
            [table.table.columns[2].name]: uri,
            [table.table.columns[3].name]: type.toUpperCase(),
          },
          {color: this.getColor(type)},
        )
      })
      console.log(table.render())
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}
