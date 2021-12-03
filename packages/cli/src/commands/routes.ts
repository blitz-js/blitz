import {ServerConfig} from "@blitzjs/server"
import {Command, flags} from "@oclif/command"
import {table as Table} from "next/dist/server/lib/logging"
import {newline} from "next/dist/server/lib/logging"

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

    process.env.BLITZ_APP_DIR = config.rootFolder

    try {
      const {loadConfigProduction} = await import("next/dist/server/config-shared")
      const {collectAllRoutes} = await import("next/dist/build/routes")
      const config = loadConfigProduction(process.cwd())
      const routes = await collectAllRoutes(process.cwd(), config)
      newline()
      const table = new Table({
        columns: [
          {name: "HTTP", alignment: "center"},
          {name: "Source File", alignment: "left"},
          {name: "Route Path", alignment: "left"},
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
      routes.forEach(({filePath, route, verb, type}: any) => {
        table.addRow(
          {
            [table.table.columns[0].name]: verb.toUpperCase(),
            [table.table.columns[1].name]: filePath,
            [table.table.columns[2].name]: route,
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
