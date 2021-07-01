import findUp from 'next/dist/compiled/find-up'
import { dirname } from 'path'

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
  const pkgJsonPath = await findUp('package.json', { cwd: dir })

  if (!pkgJsonPath) {
    throw new Error(
      'Unable to find project root by looking for your package.json'
    )
  }

  return dirname(pkgJsonPath)
}
