import {spawn} from 'cross-spawn'
import hasYarn from 'has-yarn'
import {log} from '@blitzjs/server'

const yarnInstall = (name: string): [string, string[]] => ['yarn', ['add', name]]
const npmInstall = (name: string): [string, string[]] => ['npm', ['install', '--save', name]]

export async function installNext() {
  return new Promise((resolve, reject) => {
    const message = 'Installing next: '
    const spinner = log.spinner(message)
    spinner.start()
    const installer = hasYarn() ? yarnInstall : npmInstall
    const [cmd, args] = installer('next')
    const cp = spawn(cmd, args)

    cp.stdout.on('data', (data: Buffer) => {
      spinner.text = message + ' ' + data.toString()
    })

    cp.on('exit', (code) => {
      if (code !== 0) {
        return reject('Install exited with an error')
      }
      spinner.stop()
      log.success('Finished installing next')
      resolve()
    })
  })
}
