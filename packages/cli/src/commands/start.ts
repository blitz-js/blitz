import {spawn} from 'child_process'
import {Command} from '@oclif/command'

export default class Start extends Command {
  static description = 'Start development server'
  static aliases = ['s']

  async run() {
    spawn('next', ['dev'], {stdio: 'inherit'})
  }
}
