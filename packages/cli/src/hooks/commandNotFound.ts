import {Hook} from '@oclif/config'

export const commandNotFound: Hook<'command_not_found'> = async (options) => {
  console.log(`Command ${options.id} not found`)
  process.exit(0)
}
