import fs from 'fs'
import path from 'path'

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

export function getProjectRoot() {
  return path.dirname(getConfigSrcPath())
}

export function getConfigSrcPath() {
  const tsPath = path.resolve(path.join(process.cwd(), 'blitz.config.ts'))
  if (fs.existsSync(tsPath)) {
    return tsPath
  } else {
    const jsPath = path.resolve(path.join(process.cwd(), 'blitz.config.js'))
    return jsPath
  }
}
