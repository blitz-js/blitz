import { existsSync, readFileSync } from 'fs'
import { build as esbuild } from 'esbuild'
import findUp from 'next/dist/compiled/find-up'
import os from 'os'
import { join } from 'path'
import { Header, Redirect, Rewrite } from '../../lib/load-custom-routes'
import { imageConfigDefault } from './image-config'
import { CONFIG_FILE, PHASE_PRODUCTION_SERVER } from '../lib/constants'
import { copy, remove } from 'fs-extra'
import { Middleware } from '../../types'
const debug = require('debug')('blitz:config')

export async function loadConfigAtRuntime() {
  if (!process.env.BLITZ_APP_DIR) {
    throw new Error(
      'Internal Blitz Error: process.env.BLITZ_APP_DIR is not set'
    )
  }
  const userConfigModule = require(join(process.env.BLITZ_APP_DIR, CONFIG_FILE))
  let userConfig = normalizeConfig(
    PHASE_PRODUCTION_SERVER,
    userConfigModule.default || userConfigModule
  )
  return userConfig
}

export function loadConfigProduction(pagesDir: string) {
  // eslint-disable-next-line no-eval -- block webpack from following this module path
  const userConfigModule = eval('require')(join(pagesDir, CONFIG_FILE))
  let userConfig = normalizeConfig(
    PHASE_PRODUCTION_SERVER,
    userConfigModule.default || userConfigModule
  )
  return userConfig
}

export type DomainLocales = Array<{
  http?: true
  domain: string
  locales?: string[]
  defaultLocale: string
}>

export type NextConfig = { [key: string]: any } & {
  cleanDistDir?: boolean
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
  webpack5?: false
  excludeDefaultMomentLocales?: boolean

  // -- Blitz start
  cli?: {
    clearConsoleOnBlitzDev?: boolean
    httpProxy?: string
    httpsProxy?: string
    noProxy?: string
  }
  log?: {
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  }
  middleware?: Middleware[]
  customServer?: {
    hotReload?: boolean
  }
  // -- Blitz end

  future: {
    /**
     * @deprecated this options was moved to the top level
     */
    webpack5?: false
    strictPostcssConfiguration?: boolean
  }
  experimental: {
    cpus?: number
    plugins?: boolean
    profiling?: boolean
    sprFlushToDisk?: boolean
    reactMode?: 'legacy' | 'concurrent' | 'blocking'
    workerThreads?: boolean
    pageEnv?: boolean
    optimizeImages?: boolean
    optimizeCss?: boolean
    scrollRestoration?: boolean
    stats?: boolean
    externalDir?: boolean
    conformance?: boolean
    initServer?: () => void
    amp?: {
      optimizer?: any
      validator?: string
      skipValidation?: boolean
    }
    reactRoot?: boolean
    disableOptimizedLoading?: boolean
    gzipSize?: boolean
    craCompat?: boolean
  }
}

export const defaultConfig: NextConfig = {
  env: [],
  webpack: null,
  webpackDevMiddleware: null,
  distDir: '.next',
  cleanDistDir: true,
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
    stats: false,
    externalDir: false,
    reactRoot: Number(process.env.NEXT_PRIVATE_REACT_ROOT) > 0,
    disableOptimizedLoading: false,
    gzipSize: true,
    craCompat: false,
  },
  webpack5:
    Number(process.env.NEXT_PRIVATE_TEST_WEBPACK4_MODE) > 0 ? false : undefined,
  excludeDefaultMomentLocales: true,
  future: {
    strictPostcssConfiguration: false,
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
        '> Promise returned in blitz config. https://nextjs.org/docs/messages/promise-in-next-config'
      )
    }
  }
  return config
}

export async function getConfigSrcPath(dir: string | null) {
  if (!dir) return null

  let tsPath = join(dir, 'blitz.config.ts')
  let jsPath = join(dir, 'blitz.config.js')
  let legacyPath = join(dir, 'next.config.js')

  if (existsSync(tsPath)) {
    return tsPath
  } else if (existsSync(jsPath)) {
    return jsPath
  } else if (existsSync(legacyPath)) {
    const isInternalDevelopment = __dirname.match(
      /[\\/]packages[\\/]next[\\/]dist[\\/]next-server/
    )
    if (isInternalDevelopment || process.env.VERCEL_BUILDER) {
      // We read from next.config.js that Vercel automatically adds
      debug(
        'Using next.config.js because isInternalDevelopment or VERCEL_BUILDER...'
      )
      return legacyPath
    } else {
      console.log('') // newline
      throw new Error(
        'Blitz does not support next.config.js. Please rename it to blitz.config.js'
      )
    }
  }

  if (process.env.__NEXT_TEST_MODE) {
    let tsPath2 = join(dir, '..', 'blitz.config.ts')
    let jsPath2 = join(dir, '..', 'blitz.config.js')
    let legacyPath2 = join(dir, '..', 'next.config.js')
    if (existsSync(tsPath2)) {
      return tsPath2
    } else if (existsSync(jsPath2)) {
      return jsPath2
    } else if (existsSync(legacyPath2)) {
      return legacyPath2
    }
  }

  return null
}

export function getCompiledConfigPath(dir: string) {
  return join(dir, CONFIG_FILE)
}

export async function compileConfig(dir: string | null) {
  debug('Starting compileConfig...')

  if (!dir) {
    debug('compileConfig given empty dir argument')
    return
  }

  const srcPath = await getConfigSrcPath(dir)
  debug('srcPath:', srcPath)
  const compiledPath = getCompiledConfigPath(dir)
  debug('compiledPath:', compiledPath)

  // Remove compiled file. This is important for example when user
  // had a config file but then removed it
  remove(compiledPath)

  if (!srcPath) {
    debug('Did not find a config file')
    return
  }

  if (readFileSync(srcPath, 'utf8').includes('tsconfig-paths/register')) {
    // User is manually handling their own typescript stuff
    debug(
      "Config contains 'tsconfig-paths/register', so skipping build and just copying the file"
    )
    await copy(srcPath, compiledPath)
    return
  }

  const pkgJsonPath = await findUp('package.json', { cwd: dir })

  if (!pkgJsonPath) {
    // This will happen when running blitz no inside a blitz app
    debug('Unable to find package directory')
    return
  }

  debug('Building config...')
  const pkg = require(pkgJsonPath)

  await esbuild({
    entryPoints: [srcPath],
    outfile: compiledPath,
    format: 'cjs',
    bundle: true,
    platform: 'node',
    external: [
      '*.json',
      '@blitzjs',
      '@next',
      '@zeit',
      'blitz',
      'next',
      'webpack',
      ...Object.keys(require('blitz/package').dependencies),
      ...Object.keys(pkg?.dependencies ?? {}),
      ...Object.keys(pkg?.devDependencies ?? {}),
    ],
  })
  debug('Config built.')
}
