import {
  assertPosixPath,
  convertFilePathToResolverName,
  convertFilePathToResolverType,
  convertPageFilePathToRoutePath,
  Loader,
  LoaderOptions,
  toPosixPath,
} from "../utils/loader-utils"
import {normalizeApiRoute} from "../../../client"
import {posix} from "path"

// Subset of `import type { LoaderDefinitionFunction } from 'webpack'`

export async function loader(this: Loader, input: string): Promise<string> {
  const id = this.resource
  const root = this.rootContext

  // Webpack has `_compiler` property. Turbopack does not.
  const webpackCompilerName = this._compiler?.name
  if (webpackCompilerName) {
    const isSSR = webpackCompilerName === "server"
    if (isSSR) {
      return await transformBlitzRpcResolverServer(
        input,
        toPosixPath(id),
        toPosixPath(root),
        this.query,
      )
    }
    // Handle Turbopack / other bundlers case.
    // The decision of which environment to run the loader in is decided by the loader configuration instead.
  } else {
    return await transformBlitzRpcResolverServer(
      input,
      toPosixPath(id),
      toPosixPath(root),
      this.query,
    )
  }

  return input
}

module.exports = loader

export async function transformBlitzRpcResolverServer(
  src: string,
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

  const fullRoutePath = normalizeApiRoute("/api/rpc" + routePath)

  const lines = src.split("\n")
  const newLines = lines.map((line) => {
    if (line.trim().startsWith("export default")) {
      return line.replace("export default", "const __internal_rpcHandler =")
    }

    return line
  })

  return `${newLines.join("\n")}

__internal_rpcHandler._resolverName = '${resolverName}'
__internal_rpcHandler._resolverType = '${resolverType}'
__internal_rpcHandler._routePath = '${fullRoutePath}'

export default __internal_rpcHandler`
}
