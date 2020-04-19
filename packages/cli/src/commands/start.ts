import {Command, flags} from '@oclif/command'
import {dev, prod} from '@blitzjs/server'

import {runMigrate, schemaArg} from './db'

export default class Start extends Command {
  static description = 'Start a development server'
  static aliases = ['s']

  static flags = {
    production: flags.boolean({
      char: 'p',
      description: 'Create and start a production server',
    }),
  }

  static args = [{name: 'noMigrate', description: 'Disable automatic database migration'}]

  async run() {
    const {flags} = this.parse(Start)
    const {args} = this.parse(Start)

    const config = {
      rootFolder: process.cwd(),
    }

    if (flags.production) {
      await prod(config)
    } else {
      if (!args.noMigrate) {
        runMigrate(schemaArg)
      }
      await dev(config)
    }
  }
}
