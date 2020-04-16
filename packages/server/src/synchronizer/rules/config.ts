import {readFile, writeFile} from 'fs-extra'
import {resolve} from 'path'
import File from 'vinyl'
import {Rule} from '../types'

const isBlitzConfig = (p: string) => /blitz\.config\.(js|ts)/.test(p)
const isNextConfig = (p: string) => /next\.config\.(js|ts)/.test(p)

export async function copyConfig(entries: string[], srcPath: string, destPath: string) {
  const hasBlitzConfig = !!entries.find(isBlitzConfig)
  const hasNextConfig = !!entries.find(isNextConfig)

  if (hasNextConfig) {
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

  const nextConfigShellTpl = `
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
