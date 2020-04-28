import {Hook} from '@oclif/config'
import isBlitzRoot, {IsBlitzRootError} from './utils/is-blitz-root'
import chalk from 'chalk'

const whitelistGlobal = ['new']

const hook: Hook<'init'> = async function (options) {
  // Bug with oclif
  const id = (options as any).Command.id
  if (id && whitelistGlobal.includes(id)) return

  const {err, message, depth} = await isBlitzRoot()

  if (err) {
    switch (message) {
      case IsBlitzRootError.notBlitz:
        this.log(
          `You are not inside a Blitz project, so this command won't work.\nYou can create a new app with ${chalk.bold(
            'blitz new myapp',
          )} or see help with ${chalk.bold('')}`,
        )
        return this.error('Not in correct folder')
      case IsBlitzRootError.notRoot:
        const help = depth
          ? `\nUse ${chalk.bold('cd ' + '../'.repeat(depth))} to get to the root of your project`
          : ''

        return this.error(
          `You are currently in a sub-folder of your Blitz app, but this command must be used from the root of your project.${help}`,
        )
      case IsBlitzRootError.badPackageJson:
        return this.error(`Reading package.json file`)
      default:
        return this.error(`An error occurred`)
    }
  }
}

export default hook
