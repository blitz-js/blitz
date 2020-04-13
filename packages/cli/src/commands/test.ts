import {spawn} from 'child_process'
import {Command} from '@oclif/command'
import hasYarn from 'has-yarn'

export default class Test extends Command {
  static description = 'Run project tests'
  static aliases = ['t']

  static args = [
    {
      name: 'watch',
      description: 'Run test:watch',
    },
  ]

  async run() {
    const {args} = this.parse(Test)
    let watchMode: boolean = false
    const watch = args['watch']
    if (watch) {
      watchMode = watch === 'watch' || watch === 'w'
    }
    const packageManager = hasYarn() ? 'yarn' : 'npm'

    if (watchMode) spawn(packageManager, ['test:watch'], {stdio: 'inherit'})
    else spawn(packageManager, ['test'], {stdio: 'inherit'})
  }
}
