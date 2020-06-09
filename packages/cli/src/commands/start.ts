import {Command, flags} from '@oclif/command'
import {dev, prod, ServerConfig} from '@blitzjs/server'

import {runPrismaGeneration} from './db'
import {isServerless} from 'src/utils/is-serverless'

export class Start extends Command {
  static description = 'Start a development server'
  static aliases = ['s']

  static flags = {
    production: flags.boolean({
      description: 'Create and start a production server',
    }),
    port: flags.integer({
      char: 'p',
      description: 'Set port number',
      default: 3000,
    }),
    hostname: flags.string({
      char: 'H',
      description: 'Set server hostname',
      default: 'localhost',
    }),
  }

  async run() {
    const {flags} = this.parse(Start)

    const config: ServerConfig = {
      rootFolder: process.cwd(),
      port: flags.port,
      hostname: flags.hostname,
      serverless: isServerless(process.cwd()),
    }

    try {
      if (flags.production) {
        await prod(config, runPrismaGeneration({silent: true}))
      } else {
        await dev(config, runPrismaGeneration({silent: true}))
      }
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
