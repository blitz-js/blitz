/* eslint-env jest */
import { Console } from 'console'

process.env.BLITZ_TEST_ENVIRONMENT = true

if (process.env.JEST_RETRY_TIMES) {
  const retries = Number(process.env.JEST_RETRY_TIMES)
  console.log(`Configuring jest retries: ${retries}`)
  jest.retryTimes(retries)
}

// Reset to default console instead of the verbose Jest one
global.console = new Console({ stdout: process.stdout, stderr: process.stderr })
