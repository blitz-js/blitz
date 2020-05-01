import {spawn} from 'cross-spawn'
import detect from 'detect-port'
import {Manifest} from './synchronizer/pipeline/rules/manifest'
import {through} from './synchronizer/streams'

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
  port: number,
) {
  const transform = createOutputTransformer(manifest, devFolder).stream
  const availablePort = await detect(port)

  return new Promise((res, rej) => {
    spawn(nextBin, ['dev', '-p', `${availablePort}`], {
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

export async function nextStart(nextBin: string, cwd: string) {
  return Promise.resolve(
    spawn(nextBin, ['start'], {
      cwd,
      stdio: 'inherit',
    }).on('error', (err) => {
      console.error(err)
    }),
  )
}
