import {ChildProcess} from "child_process"
import {spawn} from "cross-spawn"
import detect from "detect-port"
import * as esbuild from "esbuild"
import {existsSync, readJSONSync} from "fs-extra"
import {baseLogger, log, newline} from "next/dist/server/lib/logging"
import {getProjectRootSync} from "next/dist/server/lib/utils"
import path from "path"
import pkgDir from "pkg-dir"
import {ServerConfig} from "./config"
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
      baseLogger({displayDateTime: false}).error(
        `Couldn't start server on port ${config.port} because it's already in use`,
      )
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
      baseLogger({displayDateTime: false}).error(
        `Couldn't start server on port ${config.port} because it's already in use`,
      )
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

export function getCustomServerPath() {
  const projectRoot = getProjectRootSync()

  let serverPath = path.resolve(path.join(projectRoot, "server.ts"))
  if (existsSync(serverPath)) return serverPath

  serverPath = path.resolve(path.join(projectRoot, "server.js"))
  if (existsSync(serverPath)) return serverPath

  serverPath = path.resolve(path.join(projectRoot, "server/index.ts"))
  if (existsSync(serverPath)) return serverPath

  serverPath = path.resolve(path.join(projectRoot, "server/index.js"))
  if (existsSync(serverPath)) return serverPath

  throw new Error("Unable to find custom server")
}
export function getCustomServerBuildPath() {
  const projectRoot = getProjectRootSync()
  return path.resolve(projectRoot, ".next", "custom-server.js")
}

export function customServerExists() {
  try {
    getCustomServerPath()
    return true
  } catch {
    return false
  }
}

interface CustomServerOptions {
  watch?: boolean
}

const getEsbuildOptions = (): esbuild.BuildOptions => {
  const pkg = readJSONSync(path.join(pkgDir.sync()!, "package.json"))
  return {
    entryPoints: [getCustomServerPath()],
    outfile: getCustomServerBuildPath(),
    format: "cjs",
    bundle: true,
    platform: "node",
    external: [
      "blitz",
      "next",
      ...Object.keys(require("blitz/package").dependencies),
      ...Object.keys(pkg?.dependencies ?? {}),
      ...Object.keys(pkg?.devDependencies ?? {}),
    ],
  }
}

export function buildCustomServer({watch}: CustomServerOptions = {}) {
  const esbuildOptions = getEsbuildOptions()
  if (watch) {
    esbuildOptions.watch = {
      onRebuild(error) {
        if (error) {
          baseLogger({displayDateTime: false}).error("Failed to re-build custom server")
        } else {
          newline()
          log.progress("Custom server changed - rebuilding...")
        }
      },
    }
  }
  return esbuild.build(esbuildOptions)
}

export function startCustomServer(
  _cwd: string,
  config: ServerConfig,
  {watch}: CustomServerOptions = {},
) {
  process.env.BLITZ_APP_DIR = config.rootFolder

  const serverBuildPath = getCustomServerBuildPath()

  let spawnEnv = getSpawnEnv(config)
  if (config.env === "prod") {
    spawnEnv = {...spawnEnv, NODE_ENV: "production"}
  }

  return new Promise<void>((res, rej) => {
    let process: ChildProcess

    const RESTART_CODE = 777777

    const spawnServer = () => {
      process = spawn("node", [serverBuildPath], {
        env: spawnEnv,
        stdio: "inherit",
      })
        .on("exit", (code: number) => {
          if (code === 0) {
            res()
          } else if (watch && code === RESTART_CODE) {
            spawnServer()
          } else {
            rej(`server.js failed with status code: ${code}`)
          }
        })
        .on("error", (err) => {
          console.error(err)
          rej(err)
        })
    }

    const skipDevCustomServerBuild = config.env === "prod"

    if (skipDevCustomServerBuild) {
      spawnServer()
      return
    }

    // Handle build & Starting server
    const esbuildOptions = getEsbuildOptions()
    esbuildOptions.watch = watch
      ? {
          onRebuild(error) {
            if (error) {
              baseLogger({displayDateTime: false}).error("Failed to re-build custom server")
            } else {
              newline()
              log.progress("Custom server changed - restarting...")
              newline()
              //@ts-ignore -- incorrect TS type from node
              process.exitCode = RESTART_CODE
              process.kill("SIGABRT")
            }
          },
        }
      : undefined
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    esbuild.build(esbuildOptions).then(() => {
      spawnServer()
    })
  })
}
