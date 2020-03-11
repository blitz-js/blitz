import {spawn} from 'child_process'
import pty from 'node-pty'

export async function nextStartDev(nextBin: string, cwd: string) {
  const cp = pty
    .spawn(nextBin, ['dev'], {
      name: 'xterm-color',
      cwd,
    })
    .on('data', data => {
      // HACK: The following is temporary until we have a build
      //       manifest to lookup on a per file basis
      process.stdout.write(data.toString().replace('.blitz/caches/dev/', ''))
    })

  return Promise.resolve(cp)
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
