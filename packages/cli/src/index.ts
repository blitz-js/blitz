import {run as oclifRun} from '@oclif/command'

// Load the .env environment variable so it's avaiable for all commands
require('dotenv').config()

export function run() {
  oclifRun()
    .then(require('@oclif/command/flush'))
    // @ts-ignore (TS complains about using `catch`)
    .catch(require('@oclif/errors/handle'))
}
