import {getConfig} from "@blitzjs/config"
import type {RouteCache, RouteCacheEntry} from "@blitzjs/file-pipeline"
import {isVersionMatched, saveBlitzVersion} from "./blitz-version"
import {normalize, ServerConfig} from "./config"
import {configureRouteStages} from "./stages"

function defaultSitemapFunction(_: RouteCache): RouteCacheEntry[] {
  return []
}

export async function routes(config: ServerConfig) {
  const {
    rootFolder,
    buildFolder,
    transformFiles,
    ignore,
    include,
    isTypeScript,
    writeManifestFile,
    clean,
  } = await normalize({...config, env: "dev"})

  // if blitz version is mismatched, we need to bust the cache by cleaning the buildFolder
  const versionMatched = await isVersionMatched(buildFolder)

  const {sitemap = defaultSitemapFunction} = getConfig() as ReturnType<typeof getConfig> & {
    sitemap: typeof defaultSitemapFunction
  }

  const stages = configureRouteStages({writeManifestFile, isTypeScript})

  const {routeCache} = (await transformFiles(rootFolder, stages, buildFolder, {
    ignore,
    include,
    watch: false,
    clean: !versionMatched || clean,
  })) as {routeCache: RouteCache}

  if (!versionMatched) await saveBlitzVersion(buildFolder)

  sitemap(routeCache).forEach((sitemap_) => {
    routeCache.set(sitemap_.uri, sitemap_)
  })

  return Object.values(routeCache.get())
}
