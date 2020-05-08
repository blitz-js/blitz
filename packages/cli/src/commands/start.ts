import {Command, flags} from '@oclif/command'
import {dev, prod} from '@blitzjs/server'
import {ensureCompatibleNext} from '../utils/ensure-compatible-next'
import {runPrismaGeneration} from './db'

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

    const config = {
      rootFolder: process.cwd(),
      port: flags.port,
      hostname: flags.hostname,
    }

    try {
      // NOTE:  Running this in a hook means ctrl+c on enquirer
      //        does not cancel the process so running here
      await ensureCompatibleNext().or(() => process.exit(0))

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
