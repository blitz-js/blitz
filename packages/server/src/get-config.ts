import pkgDir from 'pkg-dir'
import path from 'path'

export const getConfig = () => {
  const packageDir = pkgDir.sync()
  if (!packageDir) {
    throw new Error('Could not find the root of the project')
  }
  const config = require(path.join(packageDir, 'blitz.config.js'))
  return config
}
