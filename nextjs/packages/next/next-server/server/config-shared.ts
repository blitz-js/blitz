import os from 'os'
import { Header, Redirect, Rewrite } from '../../lib/load-custom-routes'
import { imageConfigDefault } from './image-config'

export type DomainLocales = Array<{
  http?: true
  domain: string
  locales?: string[]
  defaultLocale: string
}>

export type NextConfig = { [key: string]: any } & {
  i18n?: {
    locales: string[]
    defaultLocale: string
    domains?: DomainLocales
    localeDetection?: false
  } | null

  headers?: () => Promise<Header[]>
  rewrites?: () => Promise<
    | Rewrite[]
    | {
        beforeFiles: Rewrite[]
        afterFiles: Rewrite[]
        fallback: Rewrite[]
      }
  >
  redirects?: () => Promise<Redirect[]>

  trailingSlash?: boolean

  future: {
    strictPostcssConfiguration?: boolean
    excludeDefaultMomentLocales?: boolean
    webpack5?: boolean
  }

  experimental: {
    cpus?: number
    plugins?: boolean
    profiling?: boolean
    sprFlushToDisk?: boolean
    reactMode?: 'legacy' | 'concurrent' | 'blocking'
    workerThreads?: boolean
    pageEnv?: boolean
    optimizeFonts?: boolean
    optimizeImages?: boolean
    optimizeCss?: boolean
    scrollRestoration?: boolean
    scriptLoader?: boolean
    stats?: boolean
    externalDir?: boolean
    serialWebpackBuild?: boolean
    babelMultiThread?: boolean
    conformance?: boolean
    amp?: {
      optimizer?: any
      validator?: string
      skipValidation?: boolean
    }
    turboMode: boolean
    reactRoot: boolean
  }
}

export const defaultConfig: NextConfig = {
  env: [],
  webpack: null,
  webpackDevMiddleware: null,
  distDir: '.next',
  assetPrefix: '',
  configOrigin: 'default',
  useFileSystemPublicRoutes: true,
  generateBuildId: () => null,
  generateEtags: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  target: 'server',
  poweredByHeader: true,
  compress: true,
  analyticsId: process.env.VERCEL_ANALYTICS_ID || '',
  images: imageConfigDefault,
  devIndicators: {
    buildActivity: true,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  amp: {
    canonicalBase: '',
  },
  basePath: '',
  sassOptions: {},
  trailingSlash: false,
  i18n: null,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  experimental: {
    cpus: Math.max(
      1,
      (Number(process.env.CIRCLE_NODE_TOTAL) ||
        (os.cpus() || { length: 1 }).length) - 1
    ),
    plugins: false,
    profiling: false,
    sprFlushToDisk: true,
    workerThreads: false,
    pageEnv: false,
    optimizeImages: false,
    optimizeCss: false,
    scrollRestoration: false,
    scriptLoader: false,
    stats: false,
    externalDir: false,
    serialWebpackBuild: false,
    turboMode: false,
    reactRoot: Number(process.env.NEXT_PRIVATE_REACT_ROOT) > 0,
  },
  future: {
    strictPostcssConfiguration: false,
    excludeDefaultMomentLocales: false,
    webpack5: Number(process.env.NEXT_PRIVATE_TEST_WEBPACK5_MODE) > 0,
  },
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
  reactStrictMode: false,
}

export function normalizeConfig(phase: string, config: any) {
  if (typeof config === 'function') {
    config = config(phase, { defaultConfig })

    if (typeof config.then === 'function') {
      throw new Error(
        '> Promise returned in next config. https://nextjs.org/docs/messages/promise-in-next-config'
      )
    }
  }
  return config
}
