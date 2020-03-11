import {spawn} from 'child_process'

export async function nextStartDev(nextBin: string, cwd: string) {
  return Promise.resolve(
    spawn(nextBin, ['dev'], {
      cwd,
      stdio: 'inherit',
    }).on('error', err => {
      console.error(err)
    }),
  )
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
