import {spawn} from 'child_process'
import * as pty from 'node-pty'
import {Manifest} from 'synchronizer/manifest'
// import chalk from 'chalk'

function transformOutput(_manifest: Manifest, _devFolder: string) {
  return (data: any) => {
    const dataStr = data.toString()

    const buildError = `ERROR\\sin\\s(${_devFolder.replace(/\//g, '\\/')}\\/[^:]+)\\(\\d+,\\d+\\)`

    const matches = new RegExp(buildError, 'g').exec(dataStr)

    if (matches) {
      const [, filepath] = matches

      if (filepath) {
        const matchedPath = _manifest.getByValue(filepath)
        if (matchedPath) {
          process.stdout.write(data.replace(filepath, matchedPath))
          return
        }
      }
    }
    process.stdout.write(data)
  }
}

export async function nextStartDev(nextBin: string, cwd: string, manifest: Manifest, devFolder: string) {
  const cb = pty
    .spawn(nextBin, ['dev'], {
      cwd,
    })
    .on('data', transformOutput(manifest, devFolder))

  return Promise.resolve(cb)
}

export async function nextBuild(nextBin: string, cwd: string) {
  return new Promise((res, rej) => {
    spawn(nextBin, ['build'], {
      cwd,
      stdio: 'inherit',
    })
      .on('exit', res)
      .on('error', rej)
  })
}

export async function nextStart(nextBin: string, cwd: string) {
  return Promise.resolve(
    spawn(nextBin, ['start'], {
      cwd,
      stdio: 'inherit',
    }).on('error', err => {
      console.error(err)
    }),
  )
}
