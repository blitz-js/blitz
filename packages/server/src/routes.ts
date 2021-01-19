import {getConfig} from "@blitzjs/config"
import type {RouteCache, RouteCacheEntry} from "@blitzjs/file-pipeline"
import {normalize, ServerConfig} from "./config"
import {configureRouteStages} from "./stages"

function defaultSitemapFunction(_: RouteCache): RouteCacheEntry[] {
  return []
}

export async function routes(config: ServerConfig) {
  const {
    rootFolder,
    routeFolder,
    transformFiles,
    ignore,
    include,
    isTypeScript,
    writeManifestFile,
  } = await normalize({...config, env: "dev"})

  const {sitemap = defaultSitemapFunction} = getConfig() as ReturnType<typeof getConfig> & {
    sitemap: typeof defaultSitemapFunction
  }

  const stages = configureRouteStages({writeManifestFile, isTypeScript})

  const {routeCache} = (await transformFiles(rootFolder, stages, routeFolder, {
    ignore,
    include,
    watch: false,
    clean: true,
  })) as {routeCache: RouteCache}

  sitemap(routeCache).forEach((sitemap_) => {
    routeCache.set(sitemap_.uri, sitemap_)
  })

  return Object.values(routeCache.get())
}
