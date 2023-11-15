import arg from "arg"
import {CliCommand} from "../../index"
import {ServerConfig} from "../../utils/config"

const build: CliCommand = async () => {
  const nextArgs = arg(
    {
      "--inspect": Boolean,
    },
    {
      permissive: true,
    },
  )

  const extraArgs = nextArgs["_"].filter((arg) => arg !== "build")

  const config: ServerConfig = {
    rootFolder: process.cwd(),
    inspect: nextArgs["--inspect"],
    env: "prod",
    extraArgs,
  }

  await import("../../utils/next-commands").then((i) => i.build(config))
}

export {build}
