import {Command} from '@oclif/command'
import {join} from 'path'
import pkgDir from 'pkg-dir'
import {log} from '@blitzjs/display'
import {runPrismaGeneration} from './db'

const projectRoot = pkgDir.sync() || process.cwd()

const seedFunctions = ['default', 'seed']

export class Seed extends Command {
  static description = `Fill database with seed data`

  async run() {
    log.branded('Seeding database')
    let spinner = log.spinner('Loading seeds').start()

    let seeds: Function | undefined = undefined

    try {
      const exports = Object.entries(require(join(projectRoot, 'db/seeds')))
      for (const functionName of seedFunctions) {
        const fn = exports.find(([name]) => functionName === name)
        if (fn) {
          seeds = fn[1] as Function
          break
        }
      }

      if (seeds === undefined) {
        throw new Error(`Cant find default or named "seed" export`)
      }
    } catch (err) {
      log.error(err)
      this.error(`Couldn't import default from db/seeds.ts or db/seeds/index.ts file`)
    }
    spinner.succeed()

    spinner = log.spinner('Checking for database migrations').start()
    await runPrismaGeneration({silent: true})
    spinner.succeed()

    try {
      console.log(log.withCaret('Seeding...'))

      const res = seeds()
      if (res && typeof res.then === 'function') {
        await res
      }

      log.success('Done seeding')
    } catch (err) {
      log.error(err)
      this.error(`Couldn't run imported function, are you sure it's a function?`)
    }
  }
}
