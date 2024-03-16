import {
  assertPosixPath,
  convertFilePathToResolverName,
  convertFilePathToResolverType,
  convertPageFilePathToRoutePath,
  Loader,
  LoaderOptions,
  toPosixPath,
} from "../utils/loader-utils"
import {posix} from "path"
import {log, ResolverConfig} from "blitz"
import {getResolverConfig} from "../../parsers/parse-rpc-config"

// Subset of `import type { LoaderDefinitionFunction } from 'webpack'`

export async function loader(this: Loader, input: string): Promise<string> {
  const id = this.resource
  const root = this.rootContext

  // Webpack has `_compiler` property. Turbopack does not.
  const webpackCompilerName = this._compiler?.name
  if (webpackCompilerName) {
    const isSSR = webpackCompilerName === "server"
    if (!isSSR) {
      return await transformBlitzRpcResolverClient(
        input,
        toPosixPath(id),
        toPosixPath(root),
        this.query,
      )
    }
    // Handle Turbopack / other bundlers case.
    // The decision of which environment to run the loader in is decided by the loader configuration instead.
  } else {
    return await transformBlitzRpcResolverClient(
      input,
      toPosixPath(id),
      toPosixPath(root),
      this.query,
    )
  }

  return input
}

module.exports = loader

export async function transformBlitzRpcResolverClient(
  _src: string,
  id: string,
  root: string,
  options?: LoaderOptions,
) {
  assertPosixPath(id)
  assertPosixPath(root)
  const resolverFilePath = "/" + posix.relative(root, id)
  assertPosixPath(resolverFilePath)
  const routePath = convertPageFilePathToRoutePath({
    appRoot: root,
    absoluteFilePath: resolverFilePath,
    resolverBasePath: options?.resolverPath,
    extraRpcBasePaths: options?.includeRPCFolders,
  })
  const resolverName = convertFilePathToResolverName(resolverFilePath)
  const resolverType = convertFilePathToResolverType(resolverFilePath)
  const resolverConfig: ResolverConfig = {
    httpMethod: "POST",
  }
  if (resolverType === "query") {
    try {
      const {httpMethod} = getResolverConfig(_src)
      if (httpMethod) {
        resolverConfig.httpMethod = httpMethod
      }
    } catch (e) {
      log.error(e as string)
    }
  }

  const code = `
    // @ts-nocheck
    import { __internal_buildRpcClient } from "@blitzjs/rpc";
    export default __internal_buildRpcClient({
      resolverName: "${resolverName}",
      resolverType: "${resolverType}",
      routePath: "${routePath}",
      httpMethod: "${resolverConfig.httpMethod}",
    });
  `

  return code
}
