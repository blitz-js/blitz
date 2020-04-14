import {platform} from 'os'
import {spawn} from 'child_process'
import {Command} from '@oclif/command'
import * as path from 'path'

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

    const prismaBinaryName = platform() === 'win32' ? 'prisma.cmd' : 'prisma'
    const prismaBinary = path.join(process.cwd(), 'node_modules/.bin', prismaBinaryName)

    // console.log('trying...')
    // const res = require.resolve('@prisma/cli', {paths: [process.cwd()]})
    // const res = resolve('@prisma/cli')
    // console.log('DEBUG', res)

    const schemaArg = `--schema=${path.join(process.cwd(), 'db', 'schema.prisma')}`

    if (command === 'migrate' || command === 'm') {
      const cp = spawn(prismaBinary, ['migrate', 'save', schemaArg, '--create-db', '--experimental'], {
        stdio: 'inherit',
      })
      cp.on('exit', (code: number) => {
        if (code == 0) {
          const cp = spawn(prismaBinary, ['migrate', 'up', schemaArg, '--create-db', '--experimental'], {
            stdio: 'inherit',
          })
          cp.on('exit', (code: number) => {
            if (code == 0) {
              spawn(prismaBinary, ['generate', schemaArg], {stdio: 'inherit'})
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
