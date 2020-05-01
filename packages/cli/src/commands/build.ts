import {Command, flags} from '@oclif/command'
import {build} from '@blitzjs/server'

export default class Build extends Command {
  static description = 'Create a production build'
  static aliases = ['b']

  static flags = {
    port: flags.integer({
      description: 'Set port number',
      default: 3000,
    }),
  }

  async run() {
    const {flags} = this.parse(Build)

    const config = {
      rootFolder: process.cwd(),
      port: flags.port,
    }

    try {
      await build(config)
    } catch (err) {
      process.exit(1) // clean up?
    }
  }
}
