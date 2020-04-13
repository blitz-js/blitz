import File from 'vinyl'
import {resolve} from 'path'
import {Rule} from '../types'
import {fileTransformStream} from '../pipeline'

type Args = {
  srcPath: string
  entries: string[]
}

function createStubNextConfig(path: string) {
  return new File({
    path: resolve(path, 'next.config.js'),
    contents: Buffer.from(`module.exports = {}`),
  })
}

function createBlitzConfigLoader(path: string) {
  const blitzConfigLoader = `
const {withBlitz} = require('@blitzjs/server');
const config = require('./blitz.config.js');
module.exports = withBlitz(config);  
`
  return new File({
    path: resolve(path, 'next.config.js'),
    contents: Buffer.from(blitzConfigLoader),
  })
}

const isConfigFileRx = /(next|blitz)\.config\.js$/

export default function configure({srcPath, entries}: Args): Rule {
  // XXX: invariant - cannot have two config files
  return (stream) => {
    const configNotFound = !entries.find((entry) => isConfigFileRx.test(entry))

    if (configNotFound) {
      stream.push(createStubNextConfig(srcPath))
    }

    return stream.pipe(
      fileTransformStream((file) => {
        if (!isConfigFileRx.test(file.path)) return file
        file.path = file.path.replace(isConfigFileRx, 'blitz.config.js')
        return [file, createBlitzConfigLoader(srcPath)]
      }),
    )
  }
}
