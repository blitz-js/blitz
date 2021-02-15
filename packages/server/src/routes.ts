import {getConfig} from "@blitzjs/config"
import type {RouteCache, RouteCacheEntry} from "@blitzjs/file-pipeline"
import {saveBlitzVersion} from "./blitz-version"
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
    env,
  } = await normalize({...config, env: "dev"})

  const {sitemap = defaultSitemapFunction} = getConfig() as ReturnType<typeof getConfig> & {
    sitemap: typeof defaultSitemapFunction
  }

  const stages = configureRouteStages({writeManifestFile, isTypeScript, buildFolder, env})

  const {routeCache} = (await transformFiles(rootFolder, stages, buildFolder, {
    ignore,
    include,
    watch: false,
    // MUST clean=true so that all files get added to route cache.
    // Probably can optimize to read from cached manifest if present
    clean: true,
  })) as {routeCache: RouteCache}

  await saveBlitzVersion(buildFolder)

  sitemap(routeCache).forEach((sitemap_) => {
    routeCache.set(sitemap_.uri, sitemap_)
  })

  return Object.values(routeCache.get())
}
