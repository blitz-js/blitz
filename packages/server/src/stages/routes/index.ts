// import {log} from "@blitzjs/display"
import type {Stage} from "@blitzjs/file-pipeline"
import {transform} from "@blitzjs/file-pipeline"
import {ensureFile, writeFile} from "fs-extra"

/**
 * Returns a Stage to assemble NextJS `/pages` folder from within
 * the BlitzJS folder structure
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
      getRouteCache().add(file, "pages")
    }

    return file
  })

  return {stream, ready: {routeCache: getRouteCache()}}
}

export const createStageSitemap: Stage = ({config, getRouteCache}) => {
  const stream: NodeJS.ReadWriteStream = transform.file(async (file) => {
    // console.log(getRouteCache().get())
    await ensureFile(`${config.dest}/route.json`)
    await writeFile(`${config.dest}/route.json`, JSON.stringify(getRouteCache().get(), null, 2))

    return file
  })

  return {stream}
}
