import arg from "arg"
import {CliCommand} from "../../index"
import {ServerConfig} from "../../utils/config"

const dev: CliCommand = async () => {
  const nextArgs = arg(
    {
      "--port": Number,
      "--hostname": String,
      "--inspect": Boolean,

      "-p": "--port",
      "-H": "--hostname",
    },
    {
      permissive: true,
    },
  )

  const config: ServerConfig = {
    rootFolder: process.cwd(),
    port: nextArgs["--port"],
    hostname: nextArgs["--hostname"],
    inspect: nextArgs["--inspect"],
    env: process.env.NODE_ENV === "production" ? "prod" : "dev",
  }

  await import("../../utils/next-commands").then((i) => i.dev(config))
}

export {dev}
