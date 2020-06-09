import * as path from 'path'
import {forceRequire} from './module'

const modulePath = (module: string) => {
  try {
    return require.resolve(module)
  } catch (e) {
    throw new Error(`Failed to load module '${module}'`)
  }
}

const isFunction = (functionToCheck: any): functionToCheck is Function =>
  typeof functionToCheck === 'function'

const toCamelCase = (name: string) =>
  name
    .replace(/[_-]([a-z])/g, (_match: string, group: string) => group.toUpperCase())
    .replace(/@[a-z]+\//, '')

const functionModuleName = (moduleName: string, fun: Function) => {
  if (fun.name && fun.name !== 'anonymous') return fun.name
  return toCamelCase(moduleName)
}

export const loadDependencies = (pkgRoot: string) => {
  const pkg = forceRequire(path.join(pkgRoot, 'package.json'))

  const modules = Object.keys(pkg.dependencies || {})
    .map((name) => [name, modulePath(name)])
    .filter(([_name, path]) => path !== null)
    .map(([name, path]) => [name, forceRequire(path)])
    .map(([name, module]) => {
      if (isFunction(module)) return {[functionModuleName(name, module)]: module}
      const defaultExport = module.default
      if (!defaultExport) return module
      if (isFunction(defaultExport)) return {[functionModuleName(name, defaultExport)]: defaultExport}
      return {
        [toCamelCase(defaultExport)]: defaultExport,
      }
    })
  return Object.assign({}, ...modules)
}
