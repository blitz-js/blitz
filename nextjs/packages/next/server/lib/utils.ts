import findUp from 'next/dist/compiled/find-up'
import { dirname } from 'path'
import { CONFIG_FILE } from '../../next-server/lib/constants'

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

  if (builtConfigPath) return builtConfigPath

  const pkgJsonPath = await findUp('package.json', { cwd: dir })

  if (!pkgJsonPath) {
    throw new Error(
      'Unable to find project root by looking for your package.json or for ' +
        CONFIG_FILE
    )
  }

  return dirname(pkgJsonPath)
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
