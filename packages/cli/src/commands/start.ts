import {Command, flags} from '@oclif/command'
import {dev, prod} from '@blitzjs/server'

import {runPrismaGeneration} from './db'

// eslint-disable-next-line import/no-default-export
export default class Start extends Command {
  static description = 'Start a development server'
  static aliases = ['s']

  static flags = {
    production: flags.boolean({
      char: 'p',
      description: 'Create and start a production server',
    }),
  }

  async run() {
    const {flags} = this.parse(Start)

    const config = {
      rootFolder: process.cwd(),
    }

    try {
      if (flags.production) {
        await prod(config)
      } else {
        await dev(config, runPrismaGeneration({silent: true}))
      }
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
