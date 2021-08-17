import chalk from 'chalk'
import { posix, join } from 'path'
import { stringify } from 'querystring'
import { API_ROUTE, DOT_NEXT_ALIAS, PAGES_DIR_ALIAS } from '../lib/constants'
import { __ApiPreviewProps } from '../server/api-utils'
import { isTargetLikeServerless } from '../server/config'
import { normalizePagePath } from '../server/normalize-page-path'
import { warn } from './output/log'
import { ClientPagesLoaderOptions } from './webpack/loaders/next-client-pages-loader'
import { ServerlessLoaderQuery } from './webpack/loaders/next-serverless-loader'
import { LoadedEnvFiles } from '@next/env'
import { convertPageFilePathToRoutePath } from './utils'
import { NextConfigComplete } from '../server/config-shared'

type PagesMapping = {
  [page: string]: string
}

export function createPagesMapping(
  pagePaths: string[],
  pageExtensions: string[]
): PagesMapping {
  const previousPages: PagesMapping = {}
  const pages: PagesMapping = pagePaths.reduce(
    (result: PagesMapping, pagePath): PagesMapping => {
      let page = `${convertPageFilePathToRoutePath(
        pagePath,
        pageExtensions
      ).replace(/\\/g, '/')}`.replace(/\/index$/, '')

      let pageKey = page === '' ? '/' : page

      if (pageKey in result) {
        warn(
          `Duplicate page detected. ${chalk.cyan(
            previousPages[pageKey]
          )} and ${chalk.cyan(pagePath)} both resolve to ${chalk.cyan(
            pageKey
          )}.`
        )
      } else {
        previousPages[pageKey] = pagePath
      }
      result[pageKey] = join(PAGES_DIR_ALIAS, pagePath).replace(/\\/g, '/')
      return result
    },
    {}
  )

  pages['/_app'] = pages['/_app'] || 'next/dist/pages/_app'
  pages['/_error'] = pages['/_error'] || 'next/dist/pages/_error'
  pages['/_document'] = pages['/_document'] || 'next/dist/pages/_document'

  return pages
}

export type WebpackEntrypoints = {
  [bundle: string]:
    | string
    | string[]
    | {
        import: string | string[]
        dependOn?: string | string[]
      }
}

type Entrypoints = {
  client: WebpackEntrypoints
  server: WebpackEntrypoints
}

interface EntrypointsCtx {
  pagesDir: string
}

export function createEntrypoints(
  pages: PagesMapping,
  target: 'server' | 'serverless' | 'experimental-serverless-trace',
  buildId: string,
  previewMode: __ApiPreviewProps,
  config: NextConfigComplete,
  loadedEnvFiles: LoadedEnvFiles,
  { pagesDir }: EntrypointsCtx
): Entrypoints {
  const client: WebpackEntrypoints = {}
  const server: WebpackEntrypoints = {}

  const hasRuntimeConfig =
    Object.keys(config.publicRuntimeConfig).length > 0 ||
    Object.keys(config.serverRuntimeConfig).length > 0

  const defaultServerlessOptions = {
    absoluteAppPath: pages['/_app'],
    absoluteDocumentPath: pages['/_document'],
    absoluteErrorPath: pages['/_error'],
    absolute404Path: pages['/404'] || '',
    distDir: DOT_NEXT_ALIAS,
    pagesDir,
    buildId,
    assetPrefix: config.assetPrefix,
    generateEtags: config.generateEtags ? 'true' : '',
    poweredByHeader: config.poweredByHeader,
    canonicalBase: config.amp.canonicalBase || '',
    basePath: config.basePath,
    runtimeConfig: hasRuntimeConfig
      ? JSON.stringify({
          publicRuntimeConfig: config.publicRuntimeConfig,
          serverRuntimeConfig: config.serverRuntimeConfig,
        })
      : '',
    previewProps: JSON.stringify(previewMode),
    // base64 encode to make sure contents don't break webpack URL loading
    loadedEnvFiles: Buffer.from(JSON.stringify(loadedEnvFiles)).toString(
      'base64'
    ),
    i18n: config.i18n ? JSON.stringify(config.i18n) : '',
  }

  Object.keys(pages).forEach((page) => {
    const absolutePagePath = pages[page]
    const bundleFile = normalizePagePath(page)
    const isApiRoute = page.match(API_ROUTE)

    const clientBundlePath = posix.join('pages', bundleFile)
    const serverBundlePath = posix.join('pages', bundleFile)

    const isLikeServerless = isTargetLikeServerless(target)

    if (isApiRoute && isLikeServerless) {
      const serverlessLoaderOptions: ServerlessLoaderQuery = {
        page,
        absolutePagePath,
        ...defaultServerlessOptions,
      }
      server[serverBundlePath] = `next-serverless-loader?${stringify(
        serverlessLoaderOptions
      )}!`
    } else if (isApiRoute || target === 'server') {
      server[serverBundlePath] = [absolutePagePath]
    } else if (isLikeServerless && page !== '/_app' && page !== '/_document') {
      const serverlessLoaderOptions: ServerlessLoaderQuery = {
        page,
        absolutePagePath,
        ...defaultServerlessOptions,
      }
      server[serverBundlePath] = `next-serverless-loader?${stringify(
        serverlessLoaderOptions
      )}!`
    }

    if (page === '/_document') {
      return
    }

    if (!isApiRoute) {
      const pageLoaderOpts: ClientPagesLoaderOptions = {
        page,
        absolutePagePath,
      }
      const pageLoader = `next-client-pages-loader?${stringify(
        pageLoaderOpts
      )}!`

      // Make sure next/router is a dependency of _app or else chunk splitting
      // might cause the router to not be able to load causing hydration
      // to fail

      client[clientBundlePath] =
        page === '/_app'
          ? [pageLoader, require.resolve('../client/router')]
          : pageLoader
    }
  })

  return {
    client,
    server,
  }
}
