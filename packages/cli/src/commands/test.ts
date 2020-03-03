import {spawn} from 'child_process'
import {Command} from '@oclif/command'

export default class Test extends Command {
  static description = 'Run project tests'

  async run() {
    spawn('yarn', ['test'], {stdio: 'inherit'})
  }
}
