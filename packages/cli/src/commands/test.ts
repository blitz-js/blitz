import {spawn} from 'child_process'
import {Command} from '@oclif/command'
import hasYarn from 'has-yarn'

export default class Test extends Command {
  static description = 'Run project tests'
  static aliases = ['t']

  async run() {
    const packageManager = hasYarn() ? 'yarn' : 'npm'

    spawn(packageManager, ['test'], {stdio: 'inherit'})
  }
}
