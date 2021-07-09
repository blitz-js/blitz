import { join, sep as pathSeparator, normalize } from 'path'
import chalk from 'chalk'
import { warn } from '../../build/output/log'
import { promises } from 'fs'
import {
  denormalizePagePath,
  normalizePathSep,
} from '../../next-server/server/normalize-page-path'
// import { fileExists } from '../../lib/file-exists'
import { recursiveFindPages } from '../../lib/recursive-readdir'
import { getIsRpcRoute } from '../../next-server/lib/utils'
import { buildPageExtensionRegex } from '../../build/utils'

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
    nameMatch = `(${page}|${page}/index)`
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
  // console.log(
  //   new RegExp(`${nameMatch}\\.(?:${pageExtensions.join('|')})$`)
  // )
  // console.log('FOUND', foundPagePaths)

  // for (const extension of pageExtensions) {
  //   if (!normalizedPagePath.endsWith('/index')) {
  //     const relativePagePath = `${page}.${extension}`
  //     const pagePath = join(rootDir, relativePagePath)
  //
  //     if (await fileExists(pagePath)) {
  //       foundPagePaths.push(relativePagePath)
  //     }
  //   }
  //
  //   const relativePagePathWithIndex = join(page, `index.${extension}`)
  //   const pagePathWithIndex = join(rootDir, relativePagePathWithIndex)
  //   if (await fileExists(pagePathWithIndex)) {
  //     foundPagePaths.push(relativePagePathWithIndex)
  //   }
  // }

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
