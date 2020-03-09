import {Command} from '@oclif/command'
import {build} from '../scripts/build'

export default class Build extends Command {
  static description = 'Create a production build'
  static aliases = ['b']

  async run() {
    const config = {
      rootFolder: process.cwd(),
      devFolder: '.blitz/caches/dev',
      buildFolder: '.blitz/caches/build',
    }

    await build(config)
  }
}
