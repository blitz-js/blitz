import {Command} from '@oclif/command'
import {spawn} from 'child_process'

export default class Console extends Command {
  static description = 'Run project REPL'
  static aliases = ['c']

  async run() {
    spawn('node', {stdio: 'inherit'})
  }
}
