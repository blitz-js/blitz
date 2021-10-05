import Observable from 'next/dist/compiled/zen-observable'
import { BLOCKED_PAGES } from '../shared/lib/constants'

export function isBlockedPage(pathname: string): boolean {
  return BLOCKED_PAGES.includes(pathname)
}

export function cleanAmpPath(pathname: string): string {
  if (pathname.match(/\?amp=(y|yes|true|1)/)) {
    pathname = pathname.replace(/\?amp=(y|yes|true|1)&?/, '?')
  }
  if (pathname.match(/&amp=(y|yes|true|1)/)) {
    pathname = pathname.replace(/&amp=(y|yes|true|1)/, '')
  }
  pathname = pathname.replace(/\?$/, '')
  return pathname
}

export const isInternalDevelopment = __dirname.match(
  /[\\/]packages[\\/]next[\\/]dist[\\/]server$/
)

export type RenderResult = Observable<string>

export function mergeResults(results: Array<RenderResult>): RenderResult {
  // @ts-ignore
  return Observable.prototype.concat.call(...results)
}

export async function resultsToString(
  results: Array<RenderResult>
): Promise<string> {
  const chunks: string[] = []
  await mergeResults(results).forEach((chunk: string) => {
    chunks.push(chunk)
  })
  return chunks.join('')
}

export const fixNodeFileTrace = () => {
  const path = require('path')
  path.resolve('.blitz.config.compiled.js')
  path.resolve('.next/server/blitz-db.js')
  path.resolve('.next/serverless/blitz-db.js')
}
export const withFixNodeFileTrace = (fn: Function) => {
  fixNodeFileTrace()
  return fn
}
