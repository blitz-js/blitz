import {forceRequire} from './module'
import path from 'path'
import globby from 'globby'
import pkgDir from 'pkg-dir'

const projectRoot = pkgDir.sync() || process.cwd()

export const BLITZ_MODULE_PATHS = [
  ...globby.sync(
    [
      'app/**/{queries,mutations}/*.{js,ts,tsx}',
      '**/utils/*.{js,ts,tsx}',
      'jobs/**/*.{js,ts,tsx}',
      'integrations/**/*.{js,ts,tsx}',
    ],
    {cwd: projectRoot, gitignore: true},
  ),
  'db',
].map((p) => path.join(projectRoot, p))

export const loadBlitz = () => {
  return Object.assign(
    {},
    ...BLITZ_MODULE_PATHS.map((modulePath) => {
      let name = path.parse(modulePath).name
      if (name === 'index') {
        const dirs = path.dirname(modulePath).split(path.sep)
        name = dirs[dirs.length - 1]
      }
      const module = forceRequire(modulePath)
      const contextObj = module.default || module
      //TODO: include all exports here, not just default
      return {
        [name]: contextObj,
      }
    }),
  )
}
