import {CliCommand} from "../index"
import {log, newLine} from "../../logging"
import {collectAllRoutes, loadConfig} from "../utils/routes-manifest"
import chalk from "chalk"
import {prettyMs} from "../../utils"

const getColor = (type: string) => {
  switch (type) {
    case "rpc":
      return "magenta"
    case "api":
      return "blue"
    default:
      return "green"
  }
}

const routes: CliCommand = async () => {
  const startTime = Date.now()
  process.env.BLITZ_APP_DIR = process.cwd()
  try {
    const config = loadConfig(process.cwd())
    const routes = await collectAllRoutes(process.cwd(), config)
    newLine()
    const table = new log.Table({
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
          [table.table.columns[0]!.name]: verb.toUpperCase(),
          [table.table.columns[1]!.name]: filePath,
          [table.table.columns[2]!.name]: route,
          [table.table.columns[3]!.name]: type.toUpperCase(),
        },
        {color: getColor(type)},
      )
    })
    console.log(table.render())
    newLine()
    console.log(
      `✨ Done ` + chalk.hex("#8a3df0").bold("in ") + `${prettyMs(Date.now() - startTime)}`,
    )
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

export {routes}
