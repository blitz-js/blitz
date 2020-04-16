import {spawn} from 'cross-spawn'
import {Command} from '@oclif/command'
import * as path from 'path'

export default class Db extends Command {
  static description = 'Run database commands'

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

    const schemaArg = `--schema=${path.join(process.cwd(), 'db', 'schema.prisma')}`

    if (command === 'migrate' || command === 'm') {
      const cp = spawn('prisma', ['migrate', 'save', schemaArg, '--create-db', '--experimental'], {
        stdio: 'inherit',
      })
      cp.on('exit', (code: number) => {
        if (code == 0) {
          const cp = spawn('prisma', ['migrate', 'up', schemaArg, '--create-db', '--experimental'], {
            stdio: 'inherit',
          })
          cp.on('exit', (code: number) => {
            if (code == 0) {
              spawn('prisma', ['generate', schemaArg], {stdio: 'inherit'})
            }
          })
        }
      })
    } else if (command === 'init' || command === 'i') {
      spawn('prisma', ['init'], {stdio: 'inherit'})
    } else {
      this.log('Missing command')
    }
  }
}
