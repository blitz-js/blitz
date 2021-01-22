import type {Stage} from "@blitzjs/file-pipeline"
import {transform} from "@blitzjs/file-pipeline"

/**
 * Returns a Stage to populate route cache based on the regex path
 */
export const createStageRoutes: Stage = ({getRouteCache}) => {
  const pagesPathRegex = /(pages[\\/][^_.].+(?<!\.test)\.(m?[tj]sx?|mdx))$/
  const rpcPathRegex = /(api[\\/].+[\\/](queries|mutations).+)$/
  const apiPathRegex = /(api[\\/].+)$/

  const stream: NodeJS.ReadWriteStream = transform.file((file) => {
    if (rpcPathRegex.test(file.path)) {
      getRouteCache().add(file, "rpc")
    } else if (apiPathRegex.test(file.path)) {
      getRouteCache().add(file, "api")
    } else if (pagesPathRegex.test(file.path)) {
      getRouteCache().add(file, "page")
    }

    return file
  })

  return {stream, ready: {routeCache: getRouteCache()}}
}
