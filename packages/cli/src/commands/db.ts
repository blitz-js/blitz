import {spawn} from 'cross-spawn'
import {flags} from '@oclif/command'
import {Command} from '@oclif/command'
import chalk from 'chalk'
import * as path from 'path'
import {resolveBinAsync} from '@blitzjs/server'

export default class Db extends Command {
  static description = `Run database commands

${chalk.bold('migrate')}   Run any needed migrations via Prisma 2 and generate Prisma Client.

${chalk.bold(
  'introspect',
)}   Will introspect the database defined in db/schema.prisma and automatically generate a complete schema.prisma file for you. Lastly, it\'ll generate Prisma Client.

${chalk.bold(
  'studio',
)}   Open the Prisma Studio UI at http://localhost:5555 so you can easily see and change data in your database.
`

  static args = [
    {
      name: 'command',
      description: 'Run specific db command',
      required: true,
    },
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args} = this.parse(Db)
    const command = args['command']

    const schemaArg = `--schema=${path.join(process.cwd(), 'db', 'schema.prisma')}`
    const prismaBin = await resolveBinAsync('@prisma/cli', 'prisma')

    if (command === 'migrate' || command === 'm') {
      const cp = spawn(prismaBin, ['migrate', 'save', schemaArg, '--create-db', '--experimental'], {
        stdio: 'inherit',
      })
      cp.on('exit', (code: number) => {
        if (code == 0) {
          const cp = spawn(prismaBin, ['migrate', 'up', schemaArg, '--create-db', '--experimental'], {
            stdio: 'inherit',
          })
          cp.on('exit', (code: number) => {
            if (code == 0) {
              spawn(prismaBin, ['generate', schemaArg], {stdio: 'inherit'}).on('exit', (code: number) => {
                if (code !== 0) {
                  process.exit(1)
                }
              })
            } else {
              process.exit(1)
            }
          })
        } else {
          process.exit(1)
        }
      })
    } else if (command === 'introspect') {
      const cp = spawn(prismaBin, ['introspect', schemaArg], {
        stdio: 'inherit',
      })
      cp.on('exit', (code: number) => {
        if (code == 0) {
          spawn(prismaBin, ['generate', schemaArg], {stdio: 'inherit'}).on('exit', (code: number) => {
            if (code !== 0) {
              process.exit(1)
            }
          })
        } else {
          process.exit(1)
        }
      })
    } else if (command === 'studio') {
      const cp = spawn(prismaBin, ['studio', schemaArg, '--experimental'], {
        stdio: 'inherit',
      })
      cp.on('exit', (code: number) => {
        if (code == 0) {
        } else {
          process.exit(1)
        }
      })
    } else {
      this.log("\nUh oh, we don't support that command.")
      this.log('You can try running a prisma command directly with:')
      this.log('\n  `npm run prisma COMMAND` or `yarn prisma COMMAND`\n')
    }
  }
}
