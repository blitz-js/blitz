import {getConfig} from "@blitzjs/config"
import type {RouteCacheEntry} from "@blitzjs/file-pipeline"
import {normalize, ServerConfig} from "./config"
import {configureRouteStages} from "./stages"

export async function routes(config: ServerConfig) {
  const {
    rootFolder,
    routeFolder,
    transformFiles,
    ignore,
    include,
    isTypescript,
    writeManifestFile,
    // clean,
  } = await normalize({...config, env: "dev"})

  const {sitemap = []} = getConfig() as Record<string, unknown> & {
    sitemap: RouteCacheEntry[]
  }

  const stages = configureRouteStages({writeManifestFile, isTypescript})

  const {routes} = await transformFiles(rootFolder, stages, routeFolder, {
    ignore,
    include,
    watch: false,
    clean: true,
  })

  sitemap.forEach((sitemap_) => {
    routes.set(sitemap_.uri, sitemap_)
  })

  return Object.values(routes.get())
}
