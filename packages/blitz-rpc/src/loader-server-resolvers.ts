import {
  assertPosixPath,
  convertFilePathToResolverName,
  convertFilePathToResolverType,
  convertPageFilePathToRoutePath,
  Loader,
  LoaderOptions,
  toPosixPath,
} from "./loader-utils"
import {normalizeApiRoute} from "./data-client"
import {posix} from "path"

// Subset of `import type { LoaderDefinitionFunction } from 'webpack'`

export async function loader(this: Loader, input: string): Promise<string> {
  const compiler = this._compiler!
  const id = this.resource
  const root = this._compiler!.context

  const isSSR = compiler.name === "server"
  if (isSSR) {
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
