import {run as oclifRun} from '@oclif/command'

// Load the .env environment variable so it's avaiable for all commands
require('dotenv').config()

export function run() {
  // @ts-ignore (TS complains about using `catch`)
  oclifRun().then(require('@oclif/command/flush')).catch(require('@oclif/errors/handle'))
}
