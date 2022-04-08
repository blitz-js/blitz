import {spawn} from "cross-spawn"
import detect from "detect-port"
import type {ServerConfig} from "./config"
const debug = require("debug")("blitz:utils")

function getSpawnEnv(config: ServerConfig) {
  let spawnEnv: NodeJS.ProcessEnv = process.env

  spawnEnv.FORCE_COLOR = "3"

  if (config.inspect) {
    spawnEnv = {...spawnEnv, NODE_OPTIONS: "--inspect"}
  }

  return spawnEnv
}

async function createCommandAndPort(config: ServerConfig, command: string) {
  let spawnCommand: string[] = [command]
  let availablePort: number

  availablePort = await detect({port: config.port ? config.port : 3000})
  spawnCommand = spawnCommand.concat(["-p", `${availablePort}`])

  if (config.hostname) {
    spawnCommand = spawnCommand.concat(["-H", `${config.hostname}`])
  }

  const spawnEnv = getSpawnEnv(config)

  return {spawnCommand, spawnEnv, availablePort}
}

export async function nextStartDev(
  nextBin: string,
  cwd: string,
  _manifest: any,
  _buildFolder: string,
  config: ServerConfig,
) {
  const {spawnCommand, spawnEnv, availablePort} = await createCommandAndPort(config, "dev")

  process.env.BLITZ_DEV_SERVER_ORIGIN = `http://localhost:${availablePort}`

  debug("cwd ", cwd)
  debug("spawn ", nextBin, spawnCommand)

  return new Promise<void>((res, rej) => {
    if (config.port && availablePort !== config.port) {
      console.error(`Couldn't start server on port ${config.port} because it's already in use`)
      rej("")
    } else {
      spawn(nextBin, spawnCommand, {
        cwd,
        env: spawnEnv,
        stdio: "inherit",
      })
        .on("exit", (code: number) => {
          if (code === 0) {
            res()
          } else {
            process.exit(code)
          }
        })

        .on("error", rej)
    }
  })
}

export function nextBuild(
  nextBin: string,
  _buildFolder: string,
  _manifest: any,
  config: ServerConfig,
) {
  const spawnEnv = getSpawnEnv(config)

  return new Promise<void>((res, rej) => {
    spawn(nextBin, ["build"], {
      env: spawnEnv,
      stdio: "inherit",
    })
      .on("exit", (code: number | null) => {
        if (code === 0 || code === null) {
          res()
        } else {
          process.exit(code)
        }
      })
      .on("error", rej)
  })
}

export function nextExport(nextBin: string, config: ServerConfig) {
  const spawnEnv = getSpawnEnv(config)

  return new Promise<void>((res, rej) => {
    spawn(nextBin, ["export"], {
      env: spawnEnv,
      stdio: "inherit",
    })
      .on("exit", (code: number | null) => {
        if (code === 0 || code === null) {
          res()
        } else {
          process.exit(code)
        }
      })
      .on("error", rej)
  })
}

export async function nextStart(nextBin: string, _buildFolder: string, config: ServerConfig) {
  const {spawnCommand, spawnEnv, availablePort} = await createCommandAndPort(config, "start")

  return new Promise<void>((res, rej) => {
    if (config.port && availablePort !== config.port) {
      console.error(`Couldn't start server on port ${config.port} because it's already in use`)
      rej("")
    } else {
      spawn(nextBin, spawnCommand, {
        env: spawnEnv,
        stdio: "inherit",
      })
        .on("exit", (code: number) => {
          if (code === 0) {
            res()
          } else {
            process.exit(code)
          }
        })
        .on("error", (err) => {
          console.error(err)
          rej(err)
        })
    }
  })
}
