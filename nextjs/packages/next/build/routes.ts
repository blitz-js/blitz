import { promises } from 'fs'
import { NextConfigComplete } from '../server/config-shared'
import { createPagesMapping } from './entries'
import { collectPages, getIsRpcFile } from './utils'
import { isInternalDevelopment } from '../server/utils'
import { join } from 'path'
import { existsSync, outputFile } from 'fs-extra'
import { baseLogger } from '../server/lib/logging'
const readFile = promises.readFile

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
}

export async function saveRouteManifest(
  directory: string,
  config: NextConfigComplete
) {
  const allRoutes = await collectAllRoutes(directory, config)
  const routes: Record<string, RouteManifestEntry> = {}

  for (let { filePath, route, type } of allRoutes) {
    if (type === 'api' || type === 'rpc') continue
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

  const { declaration, implementation } = generateManifest(routes)

  const dotBlitz = join(findNodeModulesRoot(directory), '.blitz')

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

function findNodeModulesRoot(src: string) {
  const log = baseLogger()
  let nodeModules = join(src, 'node_modules')
  let includesBlitzPackage = existsSync(join(nodeModules, 'blitz'))
  let count = 0
  while (!includesBlitzPackage) {
    // Check for node_modules at the next level up
    nodeModules = join(nodeModules, '../../node_modules')
    includesBlitzPackage = existsSync(join(nodeModules, 'blitz'))
    count++
    if (count > 5) {
      log.warn(
        "We couldn't determine your actual node_modules location, so defaulting to normal location"
      )
      nodeModules = join(src, 'node_modules')
      break
    }
  }
  return nodeModules
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

  return {
    implementation:
      'exports.Routes = {\n' +
      implementationLines.map((line) => '  ' + line).join(',\n') +
      '\n}',
    declaration: `
import type { ParsedUrlQueryInput } from "querystring"
import type { RouteUrlObject } from "next/types"

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
