import {Command, flags} from '@oclif/command'
import {dev} from '../start/dev'
import {prod} from '../start/prod'

export default class Start extends Command {
  static description = 'Start development server'
  static aliases = ['s']

  static flags = {production: flags.boolean({char: 'p'})}

  async run() {
    const {flags} = this.parse(Start)

    const config = {
      rootFolder: process.cwd(),
      devFolder: '.blitz/caches/dev',
      buildFolder: '.blitz/caches/build',
    }

    if (flags.production) {
      await prod(config)
    } else {
      await dev(config)
    }
  }
}
