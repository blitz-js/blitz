import { promises } from 'fs'
import { NextConfigComplete } from '../server/config-shared'
import { createPagesMapping } from './entries'
import { collectPages, getIsRpcFile } from './utils'
import { isInternalDevelopment } from '../server/utils'
import { join, dirname, basename } from 'path'
import { outputFile } from 'fs-extra'
import findUp from 'next/dist/compiled/find-up'
import resolveFrom from 'resolve-from'
const readFile = promises.readFile
const manifestDebug = require('debug')('blitz:manifest')

export type RouteType = 'page' | 'rpc' | 'api'
export type RouteVerb = 'get' | 'post' | 'patch' | 'head' | 'delete' | '*'
export type RouteCacheEntry = {
  filePath: string
  route: string
  verb: string
  type: RouteType
}

function getVerb(type: RouteType): RouteVerb {
  switch (type) {
    case 'api':
      return '*'
    case 'rpc':
      return 'post'
    default:
      return 'get'
  }
}

// from https://github.com/angus-c/just/blob/master/packages/array-partition/index.js
function partition(arr: any[], predicate: (value: any) => boolean) {
  if (!Array.isArray(arr)) {
    throw new Error('expected first argument to be an array')
  }
  if (typeof predicate != 'function') {
    throw new Error('expected second argument to be a function')
  }
  var first = []
  var second = []
  var length = arr.length
  for (var i = 0; i < length; i++) {
    var nextValue = arr[i]
    if (predicate(nextValue)) {
      first.push(nextValue)
    } else {
      second.push(nextValue)
    }
  }
  return [first, second]
}

const apiPathRegex = /([\\/]api[\\/])/

export async function collectAllRoutes(
  directory: string,
  config: NextConfigComplete
) {
  const routeFiles = await collectPages(directory, config.pageExtensions!)
  const rawRouteMappings = createPagesMapping(
    routeFiles,
    config.pageExtensions!
  )
  const routes: RouteCacheEntry[] = []
  for (const [route, filePath] of Object.entries(rawRouteMappings)) {
    if (['/_app', '/_document', '/_error'].includes(route)) continue
    let type: RouteType
    if (getIsRpcFile(filePath)) {
      type = 'rpc'
    } else if (apiPathRegex.test(filePath)) {
      type = 'api'
    } else {
      type = 'page'
    }
    routes.push({
      filePath: filePath.replace('private-next-pages/', ''),
      route,
      type,
      verb: getVerb(type),
    })
  }
  return routes
}

type Parameter = {
  name: string
  optional: boolean
}
interface RouteManifestEntry {
  name: string
  parameters: Parameter[]
  multipleParameters: Parameter[]
  mdx?: boolean
}

const pascalCase = (value: string): string => {
  const val = value.replace(/[-_\s/.]+(.)?/g, (_match, chr) =>
    chr ? chr.toUpperCase() : ''
  )
  return val.substr(0, 1).toUpperCase() + val.substr(1)
}

export async function saveRouteManifest(
  directory: string,
  config: NextConfigComplete
) {
  const allRoutes = await collectAllRoutes(directory, config)
  const routes: Record<string, RouteManifestEntry> = {}

  for (let { filePath, route, type } of allRoutes) {
    if (type === 'api' || type === 'rpc') continue

    if (/\.mdx$/.test(filePath)) {
      routes[route] = {
        ...parseParametersFromRoute(route),
        name: route === '/' ? 'Index' : pascalCase(route),
        mdx: true,
      }
    } else {
      const fileContents = await readFile(join(directory, filePath), {
        encoding: 'utf-8',
      })

      const defaultExportName = parseDefaultExportName(fileContents)
      if (!defaultExportName) continue

      routes[route] = {
        ...parseParametersFromRoute(route),
        name: defaultExportName,
      }
    }
  }

  const { declaration, implementation } = generateManifest(routes)

  const dotBlitz = join(await findNodeModulesRoot(directory), '.blitz')

  await outputFile(join(dotBlitz, 'index.js'), implementation, {
    encoding: 'utf-8',
  })
  await outputFile(join(dotBlitz, 'index-browser.js'), implementation, {
    encoding: 'utf-8',
  })
  await outputFile(join(dotBlitz, 'index.d.ts'), declaration, {
    encoding: 'utf-8',
  })
}

async function findNodeModulesRoot(src: string) {
  /*
   *  Because of our package structure, and because of how things like pnpm link modules,
   *  we must first find blitz package, and then find @blitzjs/core and then
   *  the root of @blitzjs/core
   *
   *  This is because we import from `.blitz` inside @blitzjs/core.
   *  If that changes, then this logic here will need to change
   */
  manifestDebug('src ' + src)
  let root: string
  if (process.env.NEXT_PNPM_TEST) {
    const nextPkgLocation = dirname(
      (await findUp('package.json', {
        cwd: resolveFrom(src, 'next'),
      })) ?? ''
    )
    manifestDebug('nextPkgLocation ' + nextPkgLocation)
    if (!nextPkgLocation) {
      throw new Error(
        "Internal Blitz Error: unable to find 'next' package location"
      )
    }
    root = join(nextPkgLocation, '../')
  } else if (isInternalDevelopment) {
    root = join(src, 'node_modules')
  } else {
    const blitzPkgLocation = dirname(
      (await findUp('package.json', {
        cwd: resolveFrom(src, 'blitz'),
      })) ?? ''
    )
    manifestDebug('blitzPkgLocation ' + blitzPkgLocation)
    if (!blitzPkgLocation) {
      throw new Error(
        "Internal Blitz Error: unable to find 'blitz' package location"
      )
    }
    const blitzCorePkgLocation = dirname(
      (await findUp('package.json', {
        cwd: resolveFrom(blitzPkgLocation, '@blitzjs/core'),
      })) ?? ''
    )
    manifestDebug('blitzCorePkgLocation ' + blitzCorePkgLocation)
    if (!blitzCorePkgLocation) {
      throw new Error(
        "Internal Blitz Error: unable to find '@blitzjs/core' package location"
      )
    }
    root = join(blitzCorePkgLocation, '../../')
  }
  manifestDebug('root ' + root)
  return root
}

export function parseDefaultExportName(contents: string): string | null {
  const result = contents.match(
    /export\s+default(?:\s+(?:const|let|class|var|function))?\s+(\w+)/
  )
  if (!result) {
    return null
  }

  return result[1] ?? null
}

function dedupeBy<T, K>(arr: T[], by: (v: T) => K): T[] {
  const allKeys = arr.map(by)
  return arr.filter((v, index) => {
    const key = by(v)
    const first = allKeys.indexOf(key)
    const last = allKeys.lastIndexOf(key)

    if (first !== last && first !== index) {
      const { 0: firstPath } = arr[first] as any
      const { 0: lastPath } = arr[last] as any
      const message = `The page component is named "${key}" on both the ${firstPath} and ${lastPath} routes. The page component must have a unique name across all routes, so change the component name on one of those routes to avoid conflict.`

      if (isInternalDevelopment) {
        console.log(message)
      } else {
        throw Error(message)
      }
    }

    return true
  })
}

export function generateManifest(
  routes: Record<string, RouteManifestEntry>
): { implementation: string; declaration: string } {
  const routesWithoutDuplicates = dedupeBy(
    Object.entries(routes),
    ([_path, { name }]) => name
  )

  const implementationLines = routesWithoutDuplicates.map(
    ([path, { name }]) => `${name}: (query) => ({ pathname: "${path}", query })`
  )

  const declarationLines = routesWithoutDuplicates.map(
    ([_path, { name, parameters, multipleParameters }]) => {
      if (parameters.length === 0 && multipleParameters.length === 0) {
        return `${name}(query?: ParsedUrlQueryInput): RouteUrlObject`
      }

      return `${name}(query: { ${[
        ...parameters.map(
          (param) =>
            param.name + (param.optional ? '?' : '') + ': string | number'
        ),
        ...multipleParameters.map(
          (param) =>
            param.name + (param.optional ? '?' : '') + ': (string | number)[]'
        ),
      ].join('; ')} } & ParsedUrlQueryInput): RouteUrlObject`
    }
  )

  const declarationEnding = declarationLines.length > 0 ? ';' : ''

  const moduleName = process.env.NEXT_PNPM_TEST ? 'next/types' : 'blitz'

  return {
    implementation:
      'exports.Routes = {\n' +
      implementationLines.map((line) => '  ' + line).join(',\n') +
      '\n}',
    declaration: `
import type { ParsedUrlQueryInput } from "querystring"
import type { RouteUrlObject } from "${moduleName}"

export const Routes: {
${declarationLines.map((line) => '  ' + line).join(';\n') + declarationEnding}
}`.trim(),
  }
}

function removeSquareBracketsFromSegments(value: string): string

function removeSquareBracketsFromSegments(value: string[]): string[]

function removeSquareBracketsFromSegments(
  value: string | string[]
): string | string[] {
  if (typeof value === 'string') {
    return value.replace('[', '').replace(']', '')
  }
  return value.map((val) => val.replace('[', '').replace(']', ''))
}

const squareBracketsRegex = /\[\[.*?\]\]|\[.*?\]/g

export function parseParametersFromRoute(
  path: string
): Pick<RouteManifestEntry, 'parameters' | 'multipleParameters'> {
  const parameteredSegments = path.match(squareBracketsRegex) ?? []
  const withoutBrackets = removeSquareBracketsFromSegments(parameteredSegments)

  const [multipleParameters, parameters] = partition(withoutBrackets, (p) =>
    p.includes('...')
  )

  return {
    parameters: parameters.map((value) => {
      const containsSquareBrackets = squareBracketsRegex.test(value)
      if (containsSquareBrackets) {
        return {
          name: removeSquareBracketsFromSegments(value),
          optional: true,
        }
      }

      return {
        name: value,
        optional: false,
      }
    }),
    multipleParameters: multipleParameters.map((param) => {
      const withoutEllipsis = param.replace('...', '')
      const containsSquareBrackets = squareBracketsRegex.test(withoutEllipsis)

      if (containsSquareBrackets) {
        return {
          name: removeSquareBracketsFromSegments(withoutEllipsis),
          optional: true,
        }
      }

      return {
        name: withoutEllipsis,
        optional: false,
      }
    }),
  }
}
