import {log} from '@blitzjs/server/src/log'

const defaultMessage = 'Press any key to continue'

export async function waitForConfirmation(message: string = defaultMessage) {
  return new Promise((res) => {
    process.stdin.resume()
    process.stdout.write(message)
    process.stdin.once('data', () => {
      log.clearLine()
      process.stdin.pause()
      res()
    })
  })
}
