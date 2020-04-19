import * as fs from 'fs'
import * as path from 'path'
// import {spawn} from 'cross-spawn'

let usageType: 'local' | 'monorepo' | 'global'

const localCLIPackagePath = path.resolve(process.cwd(), 'node_modules', '@blitzjs/cli')
const monorepoCLIPackagePath = path.resolve(process.cwd(), '../..', 'node_modules', '@blitzjs/cli')

if (fs.existsSync(localCLIPackagePath)) {
  usageType = 'local'
  console.log('BlitzJS/CLI installed locally...using that')
} else if (fs.existsSync(monorepoCLIPackagePath)) {
  usageType = 'monorepo'
  console.log('BlitzJS/CLI found locally (hoisted)...using that')
} else {
  usageType = 'global'
}

let cli
switch (usageType) {
  case 'local':
    cli = require(localCLIPackagePath)
    break
  case 'monorepo':
    cli = require(monorepoCLIPackagePath)
    break
  case 'global':
    break
}

const options = require('minimist')(process.argv.slice(2))

if (options._.length === 0 && (options.v || options.version)) {
  printVersionAndExit()
}

// const commands = options._

if (cli) {
  cli.run()
} else {
  // TODO: don't spawn. Instead, just require files
  console.log('BlitzJS/CLI not found locally; trying global...')
  // cli = spawn('blitz', [commands[0]], {stdio: 'inherit'})
  //
  // cli.stderr?.on('data', function (data) {
  //   console.log('err' + data.toString())
  // })
  //
  // cli.stdout?.on('data', function (data) {
  //   console.log('stdout' + data.toString())
  // })
  //
  // cli.on('exit', (code) => {
  //   console.log(`Blitz exited with code: ${code}`)
  // })
}

function getBlitzPkgJsonPath() {
  switch (usageType) {
    case 'local':
      return path.join(process.cwd(), 'node_modules/blitz/package.json')
    case 'monorepo':
      return path.join(process.cwd(), '../../node_modules/blitz/package.json')
    case 'global':
      console.log('ERROR: global getBlitzPkgJsonPath not handled')
      return ''
  }
}

function printVersionAndExit() {
  try {
    // TODO: always print global BlitzPkg version.
    // AND if local exists, print that version too
    console.log(`blitz: ${require(getBlitzPkgJsonPath()).version}`)
    console.log('Usage type:', usageType)
  } catch (e) {
    console.log('blitz error', e)
  }
  process.exit(0)
}
