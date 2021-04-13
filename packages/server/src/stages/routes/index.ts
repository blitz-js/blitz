import type {Stage} from "@blitzjs/file-pipeline"
import {transform} from "@blitzjs/file-pipeline"

/**
 * Returns a Stage to populate route cache based on the regex path
 */
export const createStageRoutes: Stage = ({getRouteCache}) => {
  const routeCache = getRouteCache()

  const stream: NodeJS.ReadWriteStream = transform.file((file) => {
    routeCache.add(file)
    return file
  })

  return {stream, ready: {routeCache: getRouteCache()}}
}
