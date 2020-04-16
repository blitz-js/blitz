import {readFile, writeFile} from 'fs-extra'
import {resolve} from 'path'
import File from 'vinyl'
import {Rule} from '../types'

const isBlitzConfig = (p: string) => /(blitz|next)\.config\.(js|ts)/.test(p)

export async function copyConfig(entries: string[], srcPath: string, destPath: string) {
  const configFiles = entries.filter(isBlitzConfig)

  if (configFiles.length > 1) {
    // TODO: make a nice error catcher
    const err = new Error(
      'Blitz cannot process two configuration files. Please only provide either a blitz.config.js or a next.config.js',
    )
    err.name = 'ConfigurationError'
    throw err
  }

  const [existingConfig] = configFiles

  const fileContents = !existingConfig
    ? 'module.exports = {};'
    : await readFile(resolve(srcPath, existingConfig))

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
