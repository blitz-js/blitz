import {getProjectRoot} from "@blitzjs/config"
import {log} from "@blitzjs/display"
import {ChildProcess} from "child_process"
import {spawn} from "cross-spawn"
import detect from "detect-port"
import * as esbuild from "esbuild"
import {existsSync, readJSONSync} from "fs-extra"
import path from "path"
import pkgDir from "pkg-dir"
import {ServerConfig, standardBuildFolderPathRegex} from "./config"
import {Manifest} from "./stages/manifest"
import {resolverBuildFolderReplaceRegex, resolverFullBuildPathRegex} from "./stages/rpc"
import {through} from "./streams"

function createOutputTransformer(_buildFolder: string, _manifest?: Manifest) {
  const stream = through(function (data: Buffer, _, next) {
    let outputStr = data.toString()

    // Remove the blitz build path from the output path so that the
    // printed path is the original file path
    outputStr = outputStr.replace(standardBuildFolderPathRegex, "")

    // If find a resolver path, restore printed path to original path
    if (outputStr.match(resolverFullBuildPathRegex)) {
      outputStr = outputStr.replace(resolverBuildFolderReplaceRegex, "")
    }

    if (outputStr.match(/Error:.*find.*production build/)) {
      outputStr = log.withError(
        "Could not find a production build, you must run `blitz build` before starting\n\n",
      )
    }

    next(null, Buffer.from(outputStr))
  })

  return stream
}

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
  manifest: Manifest,
  buildFolder: string,
  config: ServerConfig,
) {
  const {spawnCommand, spawnEnv, availablePort} = await createCommandAndPort(config, "dev")

  process.env.BLITZ_DEV_SERVER_ORIGIN = `http://localhost:${availablePort}`

  return new Promise<void>((res, rej) => {
    if (config.port && availablePort !== config.port) {
      log.error(`Couldn't start server on port ${config.port} because it's already in use`)
      rej("")
    } else {
      const nextjs = spawn(nextBin, spawnCommand, {
        cwd,
        env: spawnEnv,
        stdio: [process.stdin, "pipe", "pipe"],
      })
        .on("exit", (code: number) => {
          if (code === 0) {
            res()
          } else {
            process.exit(code)
          }
        })

        .on("error", rej)

      nextjs.stdout.pipe(createOutputTransformer(buildFolder, manifest)).pipe(process.stdout)
      nextjs.stderr.pipe(createOutputTransformer(buildFolder, manifest)).pipe(process.stderr)
    }
  })
}

export function nextBuild(
  nextBin: string,
  buildFolder: string,
  manifest: Manifest,
  config: ServerConfig,
) {
  const spawnEnv = getSpawnEnv(config)

  return new Promise<void>((res, rej) => {
    const nextjs = spawn(nextBin, ["build"], {
      cwd: buildFolder,
      env: spawnEnv,
      stdio: [process.stdin, "pipe", "pipe"],
    })
      .on("exit", (code: number | null) => {
        if (code === 0 || code === null) {
          res()
        } else {
          process.exit(code)
        }
      })
      .on("error", rej)

    nextjs.stdout.pipe(createOutputTransformer(buildFolder, manifest)).pipe(process.stdout)
    nextjs.stderr.pipe(createOutputTransformer(buildFolder, manifest)).pipe(process.stderr)
  })
}

export function nextExport(nextBin: string, config: ServerConfig) {
  const spawnEnv = getSpawnEnv(config)

  return new Promise<void>((res, rej) => {
    const nextjs = spawn(nextBin, ["export"], {
      env: spawnEnv,
      stdio: [process.stdin, "pipe", "pipe"],
    })
      .on("exit", (code: number | null) => {
        if (code === 0 || code === null) {
          res()
        } else {
          process.exit(code)
        }
      })
      .on("error", rej)

    nextjs.stdout.pipe(process.stdout)
    nextjs.stderr.pipe(process.stderr)
  })
}

export async function nextStart(nextBin: string, buildFolder: string, config: ServerConfig) {
  const {spawnCommand, spawnEnv, availablePort} = await createCommandAndPort(config, "start")

  return new Promise<void>((res, rej) => {
    if (config.port && availablePort !== config.port) {
      log.error(`Couldn't start server on port ${config.port} because it's already in use`)
      rej("")
    } else {
      const nextjs = spawn(nextBin, spawnCommand, {
        cwd: buildFolder,
        env: spawnEnv,
        stdio: [process.stdin, "pipe", "pipe"],
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

      nextjs.stdout.pipe(createOutputTransformer(buildFolder)).pipe(process.stdout)
      nextjs.stderr.pipe(createOutputTransformer(buildFolder)).pipe(process.stderr)
    }
  })
}

export function getCustomServerPath() {
  const projectRoot = getProjectRoot()

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
  const projectRoot = getProjectRoot()
  return path.resolve(projectRoot, ".blitz", "custom-server.js")
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
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.devDependencies),
    ],
  }
}

export function buildCustomServer({watch}: CustomServerOptions = {}) {
  const esbuildOptions = getEsbuildOptions()
  if (watch) {
    esbuildOptions.watch = {
      onRebuild(error) {
        if (error) {
          log.error("Failed to re-build custom server")
        } else {
          log.newline()
          log.progress("Custom server changed - rebuilding...")
        }
      },
    }
  }
  return esbuild.build(esbuildOptions)
}

export function startCustomServer(
  cwd: string,
  config: ServerConfig,
  {watch}: CustomServerOptions = {},
) {
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
        cwd,
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

    if (watch) {
      // Handle build & Starting server
      const esbuildOptions = getEsbuildOptions()
      esbuildOptions.watch = {
        onRebuild(error) {
          if (error) {
            log.error("Failed to re-build custom server")
          } else {
            log.newline()
            log.progress("Custom server changed - restarting...")
            log.newline()
            //@ts-ignore -- incorrect TS type from node
            process.exitCode = RESTART_CODE
            process.kill("SIGABRT")
          }
        },
      }
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      esbuild.build(esbuildOptions).then(() => {
        spawnServer()
      })
    } else {
      // No build required, Start server
      spawnServer()
    }
  })
}
