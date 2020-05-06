import {resolveBinAsync, log} from '@blitzjs/server'
import {Command, flags} from '@oclif/command'
import chalk from 'chalk'
import {spawn} from 'cross-spawn'
import {prompt} from 'enquirer'
import * as fs from 'fs'
import * as path from 'path'
import {promisify} from 'util'
import {projectRoot} from '../utils/get-project-root'

const schemaPath = path.join(process.cwd(), 'db', 'schema.prisma')
const schemaArg = `--schema=${schemaPath}`
const getPrismaBin = () => resolveBinAsync('@prisma/cli', 'prisma')

// Prisma client generation will fail if no model is defined in the schema.
// So the silent option is here to ignore that failure
export const runPrismaGeneration = async ({silent = false} = {}) => {
  const prismaBin = await getPrismaBin()

  return new Promise((resolve) => {
    spawn(prismaBin, ['generate', schemaArg], {stdio: silent ? 'ignore' : 'inherit'}).on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else if (silent) {
        resolve()
      } else {
        process.exit(1)
      }
    })
  })
}

export const runMigrate = async () => {
  const prismaBin = await getPrismaBin()

  return new Promise((resolve) => {
    const cp = spawn(prismaBin, ['migrate', 'save', schemaArg, '--create-db', '--experimental'], {
      stdio: 'inherit',
    })
    cp.on('exit', (code) => {
      if (code === 0) {
        const cp = spawn(prismaBin, ['migrate', 'up', schemaArg, '--create-db', '--experimental'], {
          stdio: 'inherit',
        })
        cp.on('exit', async (code) => {
          if (code === 0) {
            await runPrismaGeneration()
            resolve()
          } else {
            process.exit(1)
          }
        })
      } else {
        process.exit(1)
      }
    })
  })
}

export async function resetPostgres(connectionString: string, db: any): Promise<void> {
  const dbName: string = getDbName(connectionString)
  try {
    // close all other connections
    await db.raw(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname='${dbName};'`,
    )
    // currently assuming the public schema is being used
    // delete schema and recreate with the appropriate privileges
    await db.raw('DROP SCHEMA public cascade;')
    await db.raw('CREATE SCHEMA public;')
    await db.raw('GRANT ALL ON schema public TO postgres;')
    await db.raw('GRANT ALL ON schema public TO public;')
    // run migration
    //await runMigrate()
    log.success('Your database has been reset.')
    process.exit(0)
  } catch (err) {
    log.error(`Resetting the database has failed with an error from the database: `)
    log.error(err)
    process.exit(1)
  }
}

export async function resetMysql(connectionString: string, db: any): Promise<void> {
  const dbName: string = getDbName(connectionString)
  try {
    // delete database
    await db.raw(`DROP DATABASE \`${dbName}\``)
    // run migration
    await runMigrate()
    log.success('Your database has been reset.')
    process.exit(0)
  } catch (err) {
    log.error(`Resetting the database has failed with an error from the database: `)
    log.error(err)
    process.exit(1)
  }
}

export async function resetSqlite(connectionString: string): Promise<void> {
  const dbPath: string = connectionString.replace(/^(?:\.\.\/)+/, '')
  const unlink = promisify(fs.unlink)
  try {
    // delete database from folder
    await unlink(dbPath)
    // run migration
    await runMigrate()
    log.success('Your database has been reset.')
    process.exit(0)
  } catch (err) {
    log.error(`Resetting the database has failed with an error from the file system: `)
    log.error(err)
    process.exit(1)
  }
}

export function getDbName(connectionString: string): string {
  const dbUrlParts: string[] = connectionString!.split('/')
  const dbName: string = dbUrlParts[dbUrlParts.length - 1]
  return dbName
}


export default class Db extends Command {
  static description = `Run database
${chalk.bold(log.withPointing('migrate'),)}   Run any needed migrations via Prisma 2 and generate Prisma Client.
${chalk.bold(
  log.withPointing('introspect',
))}   Will introspect the database defined in db/schema.prisma and automatically \ngenerate a complete schema.prisma file for you. Lastly, it\'ll generate Prisma Client.

${chalk.bold(
  log.withPointing('studio',
))}    Open the Prisma Studio UI at http://localhost:5555 so you can easily see and\n change data in your database.

${chalk.bold(log.withPointing('reset'))}   Reset the database and run a fresh migration via Prisma 2.
`

  static args = [
    {
      name: 'Commands',
      description: Db.description,
      required: true,
    },
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args} = this.parse(Db)
    const command = args['command']

    const prismaBin = await getPrismaBin()

    if (command === 'migrate' || command === 'm') {
      await runMigrate()
    } else if (command === 'introspect') {
      const cp = spawn(prismaBin, ['introspect', schemaArg], {
        stdio: 'inherit',
      })
      cp.on('exit', (code) => {
        if (code === 0) {
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
      cp.on('exit', (code) => {
        if (code === 0) {
        } else {
          process.exit(1)
        }
      })
    } else if (command === 'reset') {
      const spinner = log.spinner('Loading your database').start()
      await runPrismaGeneration({silent: true})
      spinner.succeed()
      await prompt<{confirm: string}>({
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to reset your database and erase ALL data?',
      }).then((res) => {
        if (res.confirm) {
          const db = require(path.join(projectRoot, 'db')).default
          const dataSource: any = db.internalDatasources[0]
          const connectorType: string = dataSource.connectorType
          const connectionString: string = dataSource.url.value
          if (connectorType === 'postgresql') {
            resetPostgres(connectionString, db)
          } else if (connectorType === 'mysql') {
            resetMysql(connectionString, db)
          } else if (connectorType === 'sqlite') {
            resetSqlite(connectionString)
          } else {
            this.log('Could not find a valid database configuration')
          }
        }
      })
    } else {
      this.log("\nUh oh, we don't support that command.")
      this.log('You can try running a prisma command directly with:')
      this.log('\n  `npm run prisma COMMAND` or `yarn prisma COMMAND`\n')
    }
  }
}
