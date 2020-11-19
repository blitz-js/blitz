import {log} from "@blitzjs/display"
import {ServerConfig} from "config"
import {spawn} from "cross-spawn"
import detect from "detect-port"
import {Manifest} from "./stages/manifest"
import {through} from "./streams"

function createOutputTransformer(manifest: Manifest, devFolder: string) {
  const stream = through((data, _, next) => {
    const dataStr = data.toString()

    const buildError = `ERROR\\sin\\s(${devFolder.replace(/\//g, "\\/")}\\/[^:]+)\\(\\d+,\\d+\\)`

    const matches = new RegExp(buildError, "g").exec(dataStr)

    if (matches) {
      const [, filepath] = matches

      if (filepath) {
        const matchedPath = manifest.getByValue(filepath)
        if (matchedPath) {
          next(null, data.replace(filepath, matchedPath))
          return
        }
      }
    }
    next(null, data)
  })

  return {stream}
}

async function createCommandAndPort(config: ServerConfig, command: string) {
  let spawnCommand: string[] = [command]
  let spawnEnv: NodeJS.ProcessEnv = process.env
  let availablePort: number

  availablePort = await detect({port: config.port ? config.port : 3000})
  spawnCommand = spawnCommand.concat(["-p", `${availablePort}`])

  if (config.hostname) {
    spawnCommand = spawnCommand.concat(["-H", `${config.hostname}`])
  }

  if (config.inspect) {
    spawnEnv = {...spawnEnv, NODE_OPTIONS: "--inspect"}
  }

  return {spawnCommand, spawnEnv, availablePort}
}

export async function nextStartDev(
  nextBin: string,
  cwd: string,
  manifest: Manifest,
  devFolder: string,
  config: ServerConfig,
) {
  const transform = createOutputTransformer(manifest, devFolder).stream
  const {spawnCommand, spawnEnv, availablePort} = await createCommandAndPort(config, "dev")

  console.log({spawnCommand, cwd, spawnEnv})
  return new Promise((res, rej) => {
    if (config.port && availablePort !== config.port) {
      log.error(`Couldn't start server on port ${config.port} because it's already in use`)
      rej("")
    } else {
      spawn(nextBin, spawnCommand, {
        cwd,
        env: spawnEnv,
        stdio: [process.stdin, transform.pipe(process.stdout), transform.pipe(process.stderr)],
      })
        .on("exit", (code: number) => {
          code === 0 ? res() : rej(`'next dev' failed with status code: ${code}`)
        })

        .on("error", rej)
    }
  })
}

export function nextBuild(nextBin: string, cwd: string) {
  return new Promise((res, rej) => {
    spawn(nextBin, ["build"], {
      cwd,
      stdio: "inherit",
    })
      .on("exit", (code: number) => {
        code === 0 ? res() : rej(`'next build' failed with status code: ${code}`)
      })
      .on("error", rej)
  })
}

export async function nextStart(nextBin: string, cwd: string, config: ServerConfig) {
  const {spawnCommand, spawnEnv, availablePort} = await createCommandAndPort(config, "start")

  return new Promise((res, rej) => {
    if (config.port && availablePort !== config.port) {
      log.error(`Couldn't start server on port ${config.port} because it's already in use`)
      rej("")
    } else {
      spawn(nextBin, spawnCommand, {
        cwd,
        env: spawnEnv,
        stdio: "inherit",
      })
        .on("exit", (code: number) => {
          code === 0 ? res() : rej(`'next start' failed with status code: ${code}`)
        })
        .on("error", (err) => {
          console.error(err)
          rej(err)
        })
    }
  })
}
