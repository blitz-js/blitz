import {join, dirname} from "path"
import os from "os"
import {promises} from "fs"
const readFile = promises.readFile
import {outputFile, readdir} from "fs-extra"
import findUp from "find-up"
import resolveFrom from "resolve-from"
import Watchpack from "watchpack"
import {isInternalBlitzMonorepoDevelopment} from "./helpers"
export const CONFIG_FILE = ".blitz.config.compiled.js"
export const NEXT_CONFIG_FILE = "next.config.js"
export const PHASE_PRODUCTION_SERVER = "phase-production-server"
// Because on Windows absolute paths in the generated code can break because of numbers, eg 1 in the path,
// we have to use a private alias
export const PAGES_DIR_ALIAS = "private-next-pages"

/* Fetch next.js config */
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
export const defaultConfig: any = {
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
export function assignDefaultsBase(userConfig: {[key: string]: any}) {
  const config = Object.keys(userConfig).reduce<{[key: string]: any}>((currentConfig, key) => {
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
  }, {})
  const result = {...defaultConfig, ...config}
  return result
}
const normalizeConfig = (phase: string, config: any) => {
  if (typeof config === "function") {
    config = config(phase, {defaultConfig})

    if (typeof config.then === "function") {
      throw new Error(
        "> Promise returned in blitz config. https://nextjs.org/docs/messages/promise-in-next-config",
      )
    }
  }
  return config
}
const loadConfig = (pagesDir: string) => {
  let userConfigModule

  try {
    const path = join(pagesDir, NEXT_CONFIG_FILE)
    // eslint-disable-next-line no-eval -- block webpack from following this module path
    userConfigModule = eval("require")(path)
  } catch {
    console.log("Did not find custom config file")
    // In case user does not have custom config
    userConfigModule = {}
  }

  let userConfig = normalizeConfig(
    PHASE_PRODUCTION_SERVER,
    userConfigModule.default || userConfigModule,
  )
  return assignDefaultsBase(userConfig) as any
}

/* Find Routes */
export const topLevelFoldersThatMayContainPages = ["pages", "src", "app", "integrations"]
export function getIsRpcFile(filePathFromAppRoot: string) {
  return (
    /[\\/]queries[\\/]/.test(filePathFromAppRoot) || /[\\/]mutations[\\/]/.test(filePathFromAppRoot)
  )
}
export function getIsPageFile(filePathFromAppRoot: string) {
  return (
    /[\\/]pages[\\/]/.test(filePathFromAppRoot) ||
    /[\\/]api[\\/]/.test(filePathFromAppRoot) ||
    getIsRpcFile(filePathFromAppRoot)
  )
}
export async function recursiveFindPages(
  dir: string,
  filter: RegExp,
  ignore?: RegExp,
  arr: string[] = [],
  rootDir: string = dir,
): Promise<string[]> {
  let folders = await promises.readdir(dir)

  if (dir === rootDir) {
    folders = folders.filter((folder) => topLevelFoldersThatMayContainPages.includes(folder))
  }

  await Promise.all(
    folders.map(async (part: string) => {
      const absolutePath = join(dir, part)
      if (ignore && ignore.test(part)) return

      const pathStat = await promises.stat(absolutePath)

      if (pathStat.isDirectory()) {
        await recursiveFindPages(absolutePath, filter, ignore, arr, rootDir)
        return
      }

      if (!filter.test(part)) {
        return
      }

      const relativeFromRoot = absolutePath.replace(rootDir, "")
      if (getIsPageFile(relativeFromRoot)) {
        arr.push(relativeFromRoot)
        return
      }
    }),
  )

  return arr.sort()
}
export function buildPageExtensionRegex(pageExtensions: string[]) {
  return new RegExp(`(?<!\\.test|\\.spec)\\.(?:${pageExtensions.join("|")})$`)
}
type PagesMapping = {
  [page: string]: string
}
function stripExtension(filePath: string, pageExtensions: string[]) {
  return filePath.replace(new RegExp(`\\.+(${pageExtensions.join("|")})$`), "")
}
export function convertPageFilePathToRoutePath(filePath: string, pageExtensions: string[]) {
  return stripExtension(
    filePath
      .replace(/^.*?[\\/]pages[\\/]/, "/")
      .replace(/^.*?[\\/]api[\\/]/, "/api/")
      .replace(/^.*?[\\/]queries[\\/]/, "/api/rpc/")
      .replace(/^.*?[\\/]mutations[\\/]/, "/api/rpc/"),
    pageExtensions,
  )
}
export function createPagesMapping(pagePaths: string[], config: any) {
  const {pageExtensions, blitz} = config
  const resolverType = blitz?.resolverPath || "queries|mutations"

  const previousPages: PagesMapping = {}
  const pages = pagePaths.reduce<PagesMapping>((result, pagePath) => {
    let page = `${convertPageFilePathToRoutePath(pagePath, pageExtensions).replace(
      /\\/g,
      "/",
    )}`.replace(/\/index$/, "")
    const isResolver = pagePath.includes("/queries/") || pagePath.includes("/mutations/")
    if (isResolver) {
      if (typeof resolverType === "function") {
        page = `/api/rpc${resolverType(pagePath)}`
      } else if (resolverType === "root") {
        page = `/api/rpc${stripExtension(pagePath, pageExtensions)}`
      }
    }

    let pageKey = page === "" ? "/" : page
    if (pageKey in result) {
      console.warn(
        `Duplicate page detected. ${previousPages[pageKey]} and ${pagePath} both resolve to ${pageKey}.`,
      )
    } else {
      previousPages[pageKey] = pagePath
    }
    result[pageKey] = join(PAGES_DIR_ALIAS, pagePath).replace(/\\/g, "/")
    return result
  }, {})

  pages["/_app"] = pages["/_app"] || "next/dist/pages/_app"
  pages["/_error"] = pages["/_error"] || "next/dist/pages/_error"
  pages["/_document"] = pages["/_document"] || "next/dist/pages/_document"

  return pages
}
export function collectPages(directory: string, pageExtensions: string[]): Promise<string[]> {
  return recursiveFindPages(directory, buildPageExtensionRegex(pageExtensions))
}
function getVerb(type: string) {
  switch (type) {
    case "api":
      return "*"
    case "rpc":
      return "post"
    default:
      return "get"
  }
}
const apiPathRegex = /([\\/]api[\\/])/
export async function collectAllRoutes(directory: string, config: any) {
  const routeFiles = await collectPages(directory, config.pageExtensions!)
  const rawRouteMappings = createPagesMapping(routeFiles, config)
  const routes = []
  for (const [route, filePath] of Object.entries(rawRouteMappings)) {
    if (["/_app", "/_document", "/_error"].includes(route)) continue
    let type
    if (getIsRpcFile(filePath)) {
      type = "rpc"
    } else if (apiPathRegex.test(filePath)) {
      type = "api"
    } else {
      type = "page"
    }
    routes.push({
      filePath: filePath.replace("private-next-pages/", ""),
      route,
      type,
      verb: getVerb(type),
    })
  }
  return routes
}
function dedupeBy<T>(arr: [string, T][], by: (v: [string, T]) => string): [string, T][] {
  const allKeys = arr.map(by)
  const countKeys = allKeys.reduce(
    (obj, key) => ({...obj, [key]: (obj[key] || 0) + 1}),
    {} as {[key: string]: number},
  )
  const duplicateKeys = Object.keys(countKeys).filter((key) => countKeys[key]! > 1)

  if (duplicateKeys.length) {
    duplicateKeys.forEach((key) => {
      let errorMessage = `The page component is named "${key}" on the following routes:\n\n`
      arr
        .filter((v) => by(v) === key)
        .forEach(([route]) => {
          errorMessage += `\t${route}\n`
        })
      console.error(errorMessage)
    })

    console.error(
      "The page component must have a unique name across all routes, so change the component names so they are all unique.\n",
    )

    // Don't throw error in internal monorepo development because existing nextjs
    // integration tests all have duplicate page names
    if (process.env.NODE_ENV === "production") {
      const error = Error("Duplicate Page Name")
      delete error.stack
      throw error
    }
  }

  return arr.filter((v) => !duplicateKeys.includes(by(v)))
}
type Parameter = {
  name: string
  optional: boolean
}
interface RouteManifestEntry {
  name: string
  parameters: Parameter[]
  multipleParameters: Parameter[]
  mdx?: boolean
}
export function setupManifest(routes: Record<string, RouteManifestEntry>): {
  implementation: string
  declaration: string
} {
  const routesWithoutDuplicates = dedupeBy(Object.entries(routes), ([_path, {name}]) => name)

  const implementationLines = routesWithoutDuplicates.map(
    ([path, {name}]) => `${name}: (query) => ({ pathname: "${path}", query })`,
  )

  const declarationLines = routesWithoutDuplicates.map(
    ([_path, {name, parameters, multipleParameters}]) => {
      if (parameters.length === 0 && multipleParameters.length === 0) {
        return `${name}(query?: ParsedUrlQueryInput): RouteUrlObject`
      }

      return `${name}(query: { ${[
        ...parameters.map(
          (param) => param.name + (param.optional ? "?" : "") + ": string | number",
        ),
        ...multipleParameters.map(
          (param) => param.name + (param.optional ? "?" : "") + ": (string | number)[]",
        ),
      ].join("; ")} } & ParsedUrlQueryInput): RouteUrlObject`
    },
  )

  const declarationEnding = declarationLines.length > 0 ? ";" : ""

  return {
    implementation:
      "exports.Routes = {\n" + implementationLines.map((line) => "  " + line).join(",\n") + "\n}",
    declaration: `
import type { ParsedUrlQueryInput } from "querystring"
import type { RouteUrlObject } from "blitz"
export const Routes: {
${declarationLines.map((line) => "  " + line).join(";\n") + declarationEnding}
}`.trim(),
  }
}
function removeSquareBracketsFromSegments(value: string): string

function removeSquareBracketsFromSegments(value: string[]): string[]
function removeSquareBracketsFromSegments(value: string | string[]): string | string[] {
  if (typeof value === "string") {
    return value.replace("[", "").replace("]", "")
  }
  return value.map((val) => val.replace("[", "").replace("]", ""))
}
function partition(arr: any[], predicate: (value: any) => boolean) {
  if (!Array.isArray(arr)) {
    throw new Error("expected first argument to be an array")
  }
  if (typeof predicate != "function") {
    throw new Error("expected second argument to be a function")
  }
  var first = []
  var second = []
  var length = arr.length
  for (var i = 0; i < length; i++) {
    var nextValue = arr[i]
    if (predicate(nextValue)) {
      first.push(nextValue)
    } else {
      second.push(nextValue)
    }
  }
  return [first, second]
}
const squareBracketsRegex = /\[\[.*?\]\]|\[.*?\]/g
export function parseParametersFromRoute(
  path: string,
): Pick<RouteManifestEntry, "parameters" | "multipleParameters"> {
  const parameteredSegments = path.match(squareBracketsRegex) ?? []
  const withoutBrackets = removeSquareBracketsFromSegments(parameteredSegments)

  const [multipleParameters, parameters] = partition(withoutBrackets, (p) => p.includes("..."))

  return {
    parameters: parameters!.map((value) => {
      const containsSquareBrackets = squareBracketsRegex.test(value)
      if (containsSquareBrackets) {
        return {
          name: removeSquareBracketsFromSegments(value),
          optional: true,
        }
      }

      return {
        name: value,
        optional: false,
      }
    }),
    multipleParameters: multipleParameters!.map((param) => {
      const withoutEllipsis = param.replace("...", "")
      const containsSquareBrackets = squareBracketsRegex.test(withoutEllipsis)

      if (containsSquareBrackets) {
        return {
          name: removeSquareBracketsFromSegments(withoutEllipsis),
          optional: true,
        }
      }

      return {
        name: withoutEllipsis,
        optional: false,
      }
    }),
  }
}
const pascalCase = (value: string): string => {
  const val = value.replace(/[-_\s/.]+(.)?/g, (_match, chr) => (chr ? chr.toUpperCase() : ""))
  return val.substr(0, 1).toUpperCase() + val.substr(1)
}
export function parseDefaultExportName(contents: string): string | null {
  const result = contents.match(/export\s+default(?:\s+(?:const|let|class|var|function))?\s+(\w+)/)
  if (!result) {
    return null
  }

  return result[1] ?? null
}
export async function generateManifest() {
  const config = await loadConfig(process.cwd())
  const allRoutes = await collectAllRoutes(process.cwd(), config)
  const routes: Record<string, RouteManifestEntry> = {}

  for (let {filePath, route, type} of allRoutes) {
    if (type === "api" || type === "rpc") continue

    if (/\.mdx$/.test(filePath)) {
      routes[route] = {
        ...parseParametersFromRoute(route),
        name: route === "/" ? "Index" : pascalCase(route),
        mdx: true,
      }
    } else {
      const fileContents = await readFile(join(process.cwd(), filePath), {
        encoding: "utf-8",
      })

      const defaultExportName = parseDefaultExportName(fileContents)
      if (!defaultExportName) continue

      routes[route] = {
        ...parseParametersFromRoute(route),
        name: defaultExportName,
      }
    }
  }

  const {declaration, implementation} = setupManifest(routes)

  const dotBlitz = join(await findNodeModulesRoot(process.cwd()), ".blitz")

  await outputFile(join(dotBlitz, "index.js"), implementation, {
    encoding: "utf-8",
  })
  await outputFile(join(dotBlitz, "index-browser.js"), implementation, {
    encoding: "utf-8",
  })
  await outputFile(join(dotBlitz, "index.d.ts"), declaration, {
    encoding: "utf-8",
  })
}

async function findNodeModulesRoot(src: string) {
  let root: string
  if (isInternalBlitzMonorepoDevelopment) {
    root = join(__dirname, "..", "..", "..", "..", "/node_modules")
  } else {
    const blitzPkgLocation = dirname(
      (await findUp("package.json", {
        cwd: resolveFrom(src, "blitz"),
      })) ?? "",
    )

    if (!blitzPkgLocation) {
      throw new Error("Internal Blitz Error: unable to find 'blitz' package location")
    }

    if (blitzPkgLocation.includes(".pnpm")) {
      root = join(blitzPkgLocation, "../../../../")
    } else {
      root = join(blitzPkgLocation, "../")
    }
  }

  return root
}
let webpackWatcher: Watchpack | null = null

export async function startWatcher(pagesDir = ""): Promise<void> {
  if (webpackWatcher) {
    return
  }

  let resolved = false
  return new Promise((resolve) => {
    // Watchpack doesn't emit an event for an empty directory
    readdir(pagesDir!, (_, files) => {
      if (files?.length) {
        return
      }

      if (!resolved) {
        resolve()
        resolved = true
      }
    })

    let wp = (webpackWatcher = new Watchpack({}))

    wp.watch(
      [],
      topLevelFoldersThatMayContainPages.map((dir) => join(pagesDir!, dir)),
      Date.now(),
    )
    wp.on("aggregated", async () => {
      await generateManifest()
    })
  })
}

export async function stopWatcher(): Promise<void> {
  if (!webpackWatcher) {
    return
  }

  webpackWatcher.close()
  webpackWatcher = null
}
