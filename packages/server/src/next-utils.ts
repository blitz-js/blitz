import {spawn} from 'cross-spawn'
import detect from 'detect-port'
import {Manifest} from './stages/manifest'
import {through} from './streams'
import {ServerConfig} from 'config'

function createOutputTransformer(manifest: Manifest, devFolder: string) {
  const stream = through((data, _, next) => {
    const dataStr = data.toString()

    const buildError = `ERROR\\sin\\s(${devFolder.replace(/\//g, '\\/')}\\/[^:]+)\\(\\d+,\\d+\\)`

    const matches = new RegExp(buildError, 'g').exec(dataStr)

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

export async function nextStartDev(
  nextBin: string,
  cwd: string,
  manifest: Manifest,
  devFolder: string,
  config: ServerConfig,
) {
  const transform = createOutputTransformer(manifest, devFolder).stream
  const availablePort = await detect({port: config.port, hostname: config.hostname})

  return new Promise((res, rej) => {
    spawn(nextBin, ['dev', '-p', `${availablePort}`, '-H', config.hostname], {
      cwd,
      stdio: [process.stdin, transform.pipe(process.stdout), transform.pipe(process.stderr)],
    })
      .on('exit', (code: number) => {
        code === 0 ? res() : rej(`'next dev' failed with status code: ${code}`)
      })
      .on('error', rej)
  })
}

export async function nextBuild(nextBin: string, cwd: string) {
  return new Promise((res, rej) => {
    spawn(nextBin, ['build'], {
      cwd,
      stdio: 'inherit',
    })
      .on('exit', (code: number) => {
        code === 0 ? res() : rej(`'next build' failed with status code: ${code}`)
      })
      .on('error', rej)
  })
}

export async function nextStart(nextBin: string, cwd: string, config: ServerConfig) {
  const availablePort = await detect({port: config.port, hostname: config.hostname})
  return Promise.resolve(
    spawn(nextBin, ['start', '-p', `${availablePort}`, '-H', config.hostname], {
      cwd,
      stdio: 'inherit',
    }).on('error', (err) => {
      console.error(err)
    }),
  )
}
