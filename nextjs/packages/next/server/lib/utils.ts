import findUp from 'next/dist/compiled/find-up'
import path from 'path'
import { existsSync } from 'fs-extra'
import { dirname } from 'path'
import { CONFIG_FILE } from '../../shared/lib/constants'
import { NextConfigComplete } from '../config-shared'

export function printAndExit(message: string, code = 1) {
  if (code === 0) {
    console.log(message)
  } else {
    console.error(message)
  }

  process.exit(code)
}

export function getNodeOptionsWithoutInspect() {
  const NODE_INSPECT_RE = /--inspect(-brk)?(=\S+)?( |$)/
  return (process.env.NODE_OPTIONS || '').replace(NODE_INSPECT_RE, '')
}

export async function getProjectRoot(dir: string) {
  const builtConfigPath = await findUp(CONFIG_FILE, { cwd: dir })

  if (builtConfigPath) return path.dirname(builtConfigPath)

  const pkgJsonPath = await findUp('package.json', { cwd: dir })

  if (!pkgJsonPath) {
    throw new Error(
      'Unable to find project root by looking for your package.json or for ' +
        CONFIG_FILE
    )
  }

  return dirname(pkgJsonPath)
}

export function getProjectRootSync() {
  return path.dirname(getConfigSrcPath())
}

export function getConfigSrcPath() {
  const tsPath = path.resolve(path.join(process.cwd(), 'blitz.config.ts'))
  if (existsSync(tsPath)) {
    return tsPath
  } else {
    const jsPath = path.resolve(path.join(process.cwd(), 'blitz.config.js'))
    return jsPath
  }
}

function round(num: number, decimalPlaces: number) {
  const p = Math.pow(10, decimalPlaces)
  const m = num * p * (1 + Number.EPSILON)
  return Math.round(m) / p
}

/**
 * Formats milliseconds to a string
 * If more than 1s, it'll return seconds instead
 * @example
 * prettyMs(100) // -> `100ms`
 * prettyMs(1200) // -> `1.2s`
 * @param ms
 */
export function prettyMs(ms: number): string {
  if (Math.abs(ms) >= 1000) {
    return `${round(ms / 1000, 1)}s`
  }
  return `${ms}ms`
}

export function getSessionCookiePrefix(config: NextConfigComplete) {
  const middleware = config.middleware?.filter(
    (m) => m.config?.name === 'blitzSessionMiddleware'
  )[0]
  const sessionCookiePrefix = middleware?.config?.cookiePrefix || 'blitz'
  return sessionCookiePrefix
}
