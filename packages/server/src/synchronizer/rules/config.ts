import {readFile, writeFile, rename} from 'fs-extra'
import {resolve} from 'path'
import File from 'vinyl'
import {Rule} from '../types'

const isBlitzConfig = (p: string) => /blitz\.config\.(js|ts)/.test(p)
const isNextConfig = (p: string) => /next\.config\.(js|ts)/.test(p)

export async function copyConfig(entries: string[], srcPath: string, destPath: string) {
  const hasBlitzConfig = !!entries.find(isBlitzConfig)
  const hasNextConfig = !!entries.find(isNextConfig)

  if (hasNextConfig && !process.env.NOW_BUILDER) {
    // TODO: Pause the stream and ask the user if they wish to have their configuration file renamed
    const err = new Error(
      'Blitz does not support next.config.js. Please rename your next.config.js to blitz.config.js',
    )
    err.name = 'ConfigurationError'
    throw err
  }

  const fileContents = !hasBlitzConfig
    ? 'module.exports = {};'
    : await readFile(resolve(srcPath, 'blitz.config.js'))

  await writeFile(resolve(destPath, 'blitz.config.js'), Buffer.from(fileContents))

  // Zeit now adds configuration needed for Now, like serverless target,
  // so we need to keep and use that
  if (process.env.NOW_BUILDER) {
    rename(resolve(srcPath, 'next.config.js'), resolve(destPath, 'next-zeit.config.js'))
  }

  const nextConfigShellTpl = process.env.NOW_BUILDER
    ? `
const {withBlitz} = require('@blitzjs/server');
const zeitConfig = require('./next-zeit.config.js');
const config = require('./blitz.config.js');
module.exports = withBlitz({...config, ...zeitConfig});
`
    : `
const {withBlitz} = require('@blitzjs/server');
const config = require('./blitz.config.js');
module.exports = withBlitz(config);
`
  await writeFile(resolve(destPath, 'next.config.js'), Buffer.from(nextConfigShellTpl))
  // END HACK
}

export default function configRule(): Rule {
  return (file: File) => {
    // drop config files from stream
    if (isBlitzConfig(file.path)) return
    return file
  }
}
