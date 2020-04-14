import {platform} from 'os'
import {spawn} from 'child_process'
import {Command} from '@oclif/command'

export default class Db extends Command {
  static description = 'Run project database commands'

  static args = [
    {
      name: 'command',
      description: 'Run specific db command',
      required: true,
    },
  ]

  async run() {
    const {args} = this.parse(Db)
    const command = args['command']
    const prismaBinary = platform() === 'win32' ? 'prisma.cmd' : 'prisma'
    if (command === 'migrate' || command === 'm') {
      const cp = spawn(prismaBinary, ['migrate', 'save', '--experimental'], {stdio: 'inherit'})
      cp.on('exit', (code: number) => {
        if (code == 0) {
          const cp = spawn(prismaBinary, ['migrate', 'up', '--experimental'], {stdio: 'inherit'})
          cp.on('exit', (code: number) => {
            if (code == 0) {
              spawn(prismaBinary, ['generate'], {stdio: 'inherit'})
            }
          })
        }
      })
    } else if (command === 'init' || command === 'i') {
      spawn(prismaBinary, ['init'], {stdio: 'inherit'})
    } else {
      this.log('Missing command')
    }
  }
}
