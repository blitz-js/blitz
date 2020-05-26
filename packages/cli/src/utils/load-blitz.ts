import {forceRequire} from './module'
import path from 'path'
import globby from 'globby'
import pkgDir from 'pkg-dir'
import {REGISTER_INSTANCE} from 'ts-node'

const projectRoot = pkgDir.sync() || process.cwd()

export const setupTsnode = () => {
  if (!process[REGISTER_INSTANCE]) {
    // During blitz interal dev, oclif automatically sets up ts-node so we have to check
    require('ts-node').register({compilerOptions: {module: 'commonjs'}})
  }
  require('tsconfig-paths/register')
}

export function getBlitzModulePaths() {
  return [
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
}

export const loadBlitz = () => {
  return Object.assign(
    {},
    ...getBlitzModulePaths().map((modulePath) => {
      let name = path.parse(modulePath).name
      if (name === 'index') {
        const dirs = path.dirname(modulePath).split(path.sep)
        name = dirs[dirs.length - 1]
      }

      try {
        const module = forceRequire(modulePath)
        const contextObj = module.default || module
        //TODO: include all exports here, not just default
        return {
          [name]: contextObj,
        }
      } catch (e) {
        return {}
      }
    }),
  )
}
