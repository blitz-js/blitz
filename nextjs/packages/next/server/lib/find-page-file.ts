import { join, sep as pathSeparator, normalize } from 'path'
import chalk from 'chalk'
import { warn } from '../../build/output/log'
import { promises } from 'fs'
import { normalizePathSep } from '../normalize-page-path'
import { recursiveFindPages } from '../../lib/recursive-readdir'
import { getIsRpcRoute } from '../../shared/lib/utils'
import { buildPageExtensionRegex } from '../../build/utils'
import { denormalizePagePath } from '../normalize-page-path'

async function isTrueCasePagePath(pagePath: string, pagesDir: string) {
  const pageSegments = normalize(pagePath).split(pathSeparator).filter(Boolean)

  const segmentExistsPromises = pageSegments.map(async (segment, i) => {
    const segmentParentDir = join(pagesDir, ...pageSegments.slice(0, i))
    const parentDirEntries = await promises.readdir(segmentParentDir)
    return parentDirEntries.includes(segment)
  })

  return (await Promise.all(segmentExistsPromises)).every(Boolean)
}

export async function findPageFile(
  rootDir: string,
  normalizedPagePath: string,
  pageExtensions: string[]
): Promise<string | null> {
  const page = denormalizePagePath(normalizedPagePath)
  // console.log('[findPageFile]', { rootDir, normalizedPagePath, page })

  const allPages = await recursiveFindPages(
    rootDir,
    buildPageExtensionRegex(pageExtensions)
  )
  // console.log('allPages', allPages)

  let nameMatch: string
  if (getIsRpcRoute(page)) {
    const rpcPath = page.replace('/api/rpc', '')
    nameMatch = `(/queries${rpcPath}|/queries${rpcPath}/index|/mutations${rpcPath}|/mutations${rpcPath}/index)`
  } else if (page.startsWith('/api/')) {
    if (page.endsWith('/index')) {
      nameMatch = `{page}`
    } else {
      nameMatch = `(${page}|${page}/index)`
    }
  } else if (page === '/') {
    nameMatch = '/pages' + normalizedPagePath
  } else if (page.endsWith('/index')) {
    nameMatch = `/pages${page}/index`
  } else {
    nameMatch = `/pages(${page}|${page}/index)`
  }

  // Make the regex work for dynamic routes like [...auth].ts
  nameMatch = nameMatch.replace(/[[\]\\]/g, '\\$&')

  const foundPagePaths = allPages.filter((path) =>
    normalizePathSep(path).match(
      new RegExp(`${nameMatch}\\.(?:${pageExtensions.join('|')})$`)
    )
  )
  // console.log(new RegExp(`${nameMatch}\\.(?:${pageExtensions.join('|')})$`))
  // console.log('FOUND', foundPagePaths)

  if (foundPagePaths.length < 1) {
    return null
  }

  if (!(await isTrueCasePagePath(foundPagePaths[0], rootDir))) {
    return null
  }

  if (foundPagePaths.length > 1) {
    warn(
      `Duplicate page detected. ${chalk.cyan(
        join('pages', foundPagePaths[0])
      )} and ${chalk.cyan(
        join('pages', foundPagePaths[1])
      )} both resolve to ${chalk.cyan(normalizedPagePath)}.`
    )
  }

  return foundPagePaths[0]
}
