import {getProjectRoot} from "@blitzjs/config"
import {log} from "@blitzjs/display"
import {spawn} from "cross-spawn"
import detect from "detect-port"
import fs from "fs"
import path from "path"
import {ServerConfig, standardBuildFolderPathRegex} from "./config"
import {Manifest} from "./stages/manifest"
import {resolverBuildFolderReplaceRegex, resolverFullBuildPathRegex} from "./stages/rpc"
import {through} from "./streams"

const pathToGlobalRegex = (path: string) => {
  return new RegExp(path.replace(/\//g, "\\/"), "g")
}

function createOutputTransformer(buildFolder: string, manifest?: Manifest) {
  const projectRoot = getProjectRoot()

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
    } else if (manifest) {
      /*
       * Here we look any page files that got moved during the compilation step.
       * And then replace the compiled path with the original path
       */
      const pageMatches = /[\\/](pages[\\/].*.(j|t)sx?)/g.exec(outputStr)
      if (pageMatches) {
        const [fullMatch, simplePath] = pageMatches

        if (fullMatch) {
          const builtPath = path.join(buildFolder, simplePath)
          const originalPath = manifest.getByValue(builtPath)
          if (originalPath) {
            outputStr = outputStr.replace(
              pathToGlobalRegex(fullMatch),
              originalPath.replace(projectRoot, ""),
            )
          }
        }
      }
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

export function getCustomServerPath(cwd: string) {
  return path.resolve(cwd, "server.js")
}

export function customServerExists(cwd: string) {
  return fs.existsSync(getCustomServerPath(cwd))
}

export function startCustomServer(cwd: string, config: ServerConfig) {
  const serverPath = getCustomServerPath(cwd)

  let spawnEnv = getSpawnEnv(config)
  if (config.env === "prod") {
    spawnEnv = {...spawnEnv, NODE_ENV: "production"}
  }

  return new Promise<void>((res, rej) => {
    spawn("node", [serverPath], {
      cwd,
      env: spawnEnv,
      stdio: "inherit",
    })
      .on("exit", (code: number) => {
        code === 0 ? res() : rej(`server.js failed with status code: ${code}`)
      })
      .on("error", (err) => {
        console.error(err)
        rej(err)
      })
  })
}
