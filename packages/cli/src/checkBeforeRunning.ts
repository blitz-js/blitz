import {Hook} from '@oclif/config'
import {readFile} from 'fs-extra'

const whitelistGlobal = ['new']

const hook: Hook<'init'> = async function (options) {
  if (options.id && whitelistGlobal.includes(options.id)) return

  try {
    await readFile('blitz.config.js')
  } catch (err) {
    this.error(`It appears that you're not running in a blitz project`)
  }
}

export default hook
