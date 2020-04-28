import {Hook} from '@oclif/config'
import chalk from 'chalk'

import isBlitzRoot, {IsBlitzRootError} from './utils/is-blitz-root'

const whitelistGlobal = ['new']

const hook: Hook<'init'> = async function (options) {
  // Bug with oclif
  const id = (options as any).Command.id
  if (id && whitelistGlobal.includes(id)) return

  const {err, message, depth} = await isBlitzRoot()

  if (err) {
    switch (message) {
      case IsBlitzRootError.NotBlitz:
        this.log(
          `You are not inside a Blitz project, so this command won't work.\nYou can create a new app with ${chalk.bold(
            'blitz new myapp',
          )} or see help with ${chalk.bold('')}`,
        )
        return this.error('Not in correct folder')
      case IsBlitzRootError.NotRoot:
        const help = depth
          ? `\nUse ${chalk.bold('cd ' + '../'.repeat(depth))} to get to the root of your project`
          : ''

        return this.error(
          `You are currently in a sub-folder of your Blitz app, but this command must be used from the root of your project.${help}`,
        )
      case IsBlitzRootError.BadPackageJson:
        return this.error(`Reading package.json file`)
      default:
        return this.error(`An error occurred`)
    }
  }
}

export default hook
