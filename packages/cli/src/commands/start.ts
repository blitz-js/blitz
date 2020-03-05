import {Command} from '@oclif/command'
import {startDev} from '../scripts/startDev'

export default class Start extends Command {
  static description = 'Start development server'
  static aliases = ['s']

  async run() {
    const root = process.cwd()
    return await startDev({root})
  }
}
