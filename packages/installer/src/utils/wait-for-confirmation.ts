const defaultMessage = 'Press enter to continue'

export async function waitForConfirmation(message: string = defaultMessage) {
  return new Promise((res) => {
    process.stdin.resume()
    process.stdout.write(message)
    process.stdin.once('data', () => {
      process.stdin.pause()
      res()
    })
  })
}
