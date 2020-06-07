import {Command} from '@oclif/command'
import {log} from '@blitzjs/display'
import spawn from 'cross-spawn'

export class GUI extends Command {
  static description = 'Runs the Blitz GUI'
  static aliases = ['ui']

  async run() {
    log.branded('You started the Blitz GUI')

    const startGUIResult = spawn.sync('@blitzjs/gui', ['start'], {
      stdio: 'ignore',
    })

    if (startGUIResult.status !== 0) {
      log.warning('Failed to start Blitz GUI.')
    }
  }
}
