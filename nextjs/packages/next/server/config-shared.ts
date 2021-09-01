import os from 'os'
import { Header, Redirect, Rewrite } from '../lib/load-custom-routes'
import { ImageConfig, imageConfigDefault } from './image-config'
import { existsSync, readFileSync } from 'fs'
import { build as esbuild } from 'esbuild'
import findUp from 'next/dist/compiled/find-up'
import { join } from 'path'
import { CONFIG_FILE, PHASE_PRODUCTION_SERVER } from '../shared/lib/constants'
import { copy, remove } from 'fs-extra'
import { Middleware } from '../shared/lib/utils'
import { isInternalDevelopment } from './utils'
const debug = require('debug')('blitz:config')

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export function loadConfigAtRuntime() {
  if (!process.env.BLITZ_APP_DIR) {
    throw new Error(
      'Internal Blitz Error: process.env.BLITZ_APP_DIR is not set'
    )
  }
  return loadConfigProduction(process.env.BLITZ_APP_DIR)
}

export function loadConfigProduction(pagesDir: string): NextConfigComplete {
  let userConfigModule
  try {
    // eslint-disable-next-line no-eval -- block webpack from following this module path
    userConfigModule = eval('require')(join(pagesDir, CONFIG_FILE))
  } catch {
    // In case user does not have custom config
    userConfigModule = {}
  }
  let userConfig = normalizeConfig(
    PHASE_PRODUCTION_SERVER,
    userConfigModule.default || userConfigModule
  )
  return assignDefaultsBase(userConfig) as any
}

type NoOptionals<T> = {
  [P in keyof T]-?: T[P]
}

export type NextConfigComplete = NoOptionals<NextConfig>

export interface I18NConfig {
  defaultLocale: string
  domains?: DomainLocale[]
  localeDetection?: false
  locales: string[]
}

export interface DomainLocale {
  defaultLocale: string
  domain: string
  http?: true
  locales?: string[]
}

export interface ESLintConfig {
  /** Only run ESLint on these directories with `next lint` and `next build`. */
  dirs?: string[]
  /** Do not run ESLint during production builds (`next build`). */
  ignoreDuringBuilds?: boolean
}

export interface TypeScriptConfig {
  /** Do not run TypeScript during production builds (`next build`). */
  ignoreBuildErrors?: boolean
}

export type NextConfig = { [key: string]: any } & {
  i18n?: I18NConfig | null

  eslint?: ESLintConfig
  typescript?: TypeScriptConfig

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

  webpack5?: false
  excludeDefaultMomentLocales?: boolean

  webpack?:
    | ((
        config: any,
        context: {
          dir: string
          dev: boolean
          isServer: boolean
          buildId: string
          config: NextConfigComplete
          defaultLoaders: { babel: any }
          totalPages: number
          webpack: any
        }
      ) => any)
    | null

  trailingSlash?: boolean
  env?: { [key: string]: string }
  distDir?: string
  cleanDistDir?: boolean
  assetPrefix?: string
  useFileSystemPublicRoutes?: boolean
  generateBuildId?: () => string | null | Promise<string | null>
  generateEtags?: boolean
  pageExtensions?: string[]
  compress?: boolean
  poweredByHeader?: boolean
  images?: ImageConfig
  devIndicators?: {
    buildActivity?: boolean
  }
  onDemandEntries?: {
    maxInactiveAge?: number
    pagesBufferLength?: number
  }
  amp?: {
    canonicalBase?: string
  }
  basePath?: string
  sassOptions?: { [key: string]: any }
  productionBrowserSourceMaps?: boolean
  optimizeFonts?: boolean
  reactStrictMode?: boolean
  publicRuntimeConfig?: { [key: string]: any }
  serverRuntimeConfig?: { [key: string]: any }
  httpAgentOptions?: { keepAlive?: boolean }

  // -- Blitz start
  cli?: {
    clearConsoleOnBlitzDev?: boolean
    httpProxy?: string
    httpsProxy?: string
    noProxy?: string
  }
  log?: {
    level: LogLevel
  }
  middleware?: Middleware[]
  customServer?: {
    hotReload?: boolean
  }
  // -- Blitz end

  future?: {
    /**
     * @deprecated this options was moved to the top level
     */
    webpack5?: false
    strictPostcssConfiguration?: boolean
  }
  experimental?: {
    swcMinify?: boolean
    swcLoader?: boolean
    cpus?: number
    sharedPool?: boolean
    plugins?: boolean
    profiling?: boolean
    isrFlushToDisk?: boolean
    reactMode?: 'legacy' | 'concurrent' | 'blocking'
    workerThreads?: boolean
    pageEnv?: boolean
    optimizeImages?: boolean
    optimizeCss?: boolean
    scrollRestoration?: boolean
    stats?: boolean
    externalDir?: boolean
    conformance?: boolean
    amp?: {
      optimizer?: any
      validator?: string
      skipValidation?: boolean
    }
    initServer?: () => void // blitz
    reactRoot?: boolean
    disableOptimizedLoading?: boolean
    gzipSize?: boolean
    craCompat?: boolean
    esmExternals?: boolean | 'loose'
    staticPageGenerationTimeout?: number
    isrMemoryCacheSize?: number
    nftTracing?: boolean
    concurrentFeatures?: boolean
  }
}

export const defaultConfig: NextConfig = {
  env: {},
  webpack: null,
  webpackDevMiddleware: null,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
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
  log: {
    level: 'info',
  },
  webpack5:
    Number(process.env.NEXT_PRIVATE_TEST_WEBPACK4_MODE) > 0 ? false : undefined,
  excludeDefaultMomentLocales: true,
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
  reactStrictMode: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  experimental: {
    swcLoader: false,
    swcMinify: false,
    cpus: Math.max(
      1,
      (Number(process.env.CIRCLE_NODE_TOTAL) ||
        (os.cpus() || { length: 1 }).length) - 1
    ),
    sharedPool: false,
    plugins: false,
    profiling: false,
    isrFlushToDisk: true,
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
    esmExternals: false,
    staticPageGenerationTimeout: 60,
    // default to 50MB limit
    isrMemoryCacheSize: 50 * 1024 * 1024,
    nftTracing: false,
    concurrentFeatures: false,
  },
  future: {
    strictPostcssConfiguration: false,
  },
}

export function assignDefaultsBase(userConfig: { [key: string]: any }) {
  const config = Object.keys(userConfig).reduce<{ [key: string]: any }>(
    (currentConfig, key) => {
      const value = userConfig[key]

      if (value === undefined || value === null) {
        return currentConfig
      }

      // Copied from assignDefaults in server/config.ts
      if (!!value && value.constructor === Object) {
        currentConfig[key] = {
          ...defaultConfig[key],
          ...Object.keys(value).reduce<any>((c, k) => {
            const v = value[k]
            if (v !== undefined && v !== null) {
              c[k] = v
            }
            return c
          }, {}),
        }
      } else {
        currentConfig[key] = value
      }

      return currentConfig
    },
    {}
  )
  const result = { ...defaultConfig, ...config }
  return result
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
