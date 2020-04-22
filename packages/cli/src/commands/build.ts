import {Command} from '@oclif/command'
import {build} from '@blitzjs/server'

export default class Build extends Command {
  static description = 'Create a production build'
  static aliases = ['b']

  async run() {
    const config = {
      rootFolder: process.cwd(),
    }

    try {
      await build(config)
    } catch (err) {
      process.exit(1) // clean up?
    }
  }
}
