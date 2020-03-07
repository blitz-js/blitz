import {Command} from '@oclif/command'
import {dev} from '../start/dev'

export default class Start extends Command {
  static description = 'Start development server'
  static aliases = ['s']

  async run() {
    const root = process.cwd()
    return await dev({root})
  }
}
