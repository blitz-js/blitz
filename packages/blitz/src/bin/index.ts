import * as fs from 'fs'
import * as path from 'path'
import {spawn} from 'child_process'

const options = require('minimist')(process.argv.slice(2))

const getCliPath = function() {
  return [path.resolve(process.cwd(), 'node_modules', '@blitzjs/cli'), path.resolve(process.cwd(), '../..', 'node_modules', '@blitzjs/cli')]
}

const getBlitzCorePkgJsonPath = function() {
  return path.resolve(process.cwd(), 'node_modules', 'blitz', 'package.json')
}

if (options._.length === 0 && (options.v || options.version)) {
  printVersionAndExit(getBlitzCorePkgJsonPath())
}

let cli; 
const [normal, monorepo] = getCliPath()


if(fs.existsSync(normal)) {
  console.log('BlitzJS/CLI installed locally...using that')
  cli = require(normal)
} else if (fs.existsSync(monorepo)) {
  console.log('BlitzJS/CLI found locally (hoisted)...using that')
  cli = require(path.resolve('../../node_modules/@blitzjs/cli'))
}
const commands = options._; 

if (cli) {
  cli.run()
} else {
  console.log('BlitzJS/CLI not found locally; trying global...')
  cli = spawn('blitz', [commands[0]], {stdio: 'inherit'})

  cli.stderr?.on('data', function(data) {
    console.log('err' + data.toString())
  })

  cli.stdout?.on('data', function(data) {
    console.log('stdout' +  data.toString())
  })
  
  cli.on('exit', (code) => {
    console.log(`Blitz exited with code: ${code}`)
  })

}

function printVersionAndExit(blitzPath: string) {
  console.log(`blitz: ${require('./package.json').version}`)
  try {
    console.log(`@blitz/core: ${require(blitzPath).version}`)
  } catch (e) {
    console.log('blitz error', e)
  }
}