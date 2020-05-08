import {Command, flags} from '@oclif/command'
import {build} from '@blitzjs/server'

export class Build extends Command {
  static description = 'Create a production build'
  static aliases = ['b']

  static flags = {
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
    const {flags} = this.parse(Build)

    const config = {
      rootFolder: process.cwd(),
      port: flags.port,
      hostname: flags.hostname,
    }

    try {
      // NOTE:  Running this in a hook means ctrl+c on enquirer
      //        does not cancel the process so running here
      await ensureCompatibleNext().or(() => process.exit(0))
      await build(config)
    } catch (err) {
      console.error(err)
      process.exit(1) // clean up?
    }
  }
}
