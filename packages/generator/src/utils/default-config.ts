import os from "os"

export const VALID_LOADERS = ["default", "imgix", "cloudinary", "akamai", "custom"] as const

export type LoaderValue = typeof VALID_LOADERS[number]

export type ImageConfig = {
  deviceSizes: number[]
  imageSizes: number[]
  loader: LoaderValue
  path: string
  domains?: string[]
  disableStaticImages?: boolean
  minimumCacheTTL?: number
}

export const imageConfigDefault: ImageConfig = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  path: "/_next/image",
  loader: "default",
  domains: [],
  disableStaticImages: false,
  minimumCacheTTL: 60,
}

export const defaultConfig: {[key: string]: any} = {
  env: {},
  webpack: null,
  webpackDevMiddleware: null,
  distDir: ".next",
  cleanDistDir: true,
  assetPrefix: "",
  configOrigin: "default",
  useFileSystemPublicRoutes: true,
  generateBuildId: () => null,
  generateEtags: true,
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  target: "server",
  poweredByHeader: true,
  compress: true,
  analyticsId: process.env.VERCEL_ANALYTICS_ID || "",
  images: imageConfigDefault,
  devIndicators: {
    buildActivity: true,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  amp: {
    canonicalBase: "",
  },
  basePath: "",
  sassOptions: {},
  trailingSlash: false,
  i18n: null,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  log: {
    level: "info",
  },
  webpack5: Number(process.env.NEXT_PRIVATE_TEST_WEBPACK4_MODE) > 0 ? false : undefined,
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
      (Number(process.env.CIRCLE_NODE_TOTAL) || (os.cpus() || {length: 1}).length) - 1,
    ),
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
    disableOptimizedLoading: false,
    gzipSize: true,
    craCompat: false,
    esmExternals: false,
    staticPageGenerationTimeout: 60,
    pageDataCollectionTimeout: 60,
    // default to 50MB limit
    isrMemoryCacheSize: 50 * 1024 * 1024,
    concurrentFeatures: false,
  },
  future: {
    strictPostcssConfiguration: false,
  },
}
