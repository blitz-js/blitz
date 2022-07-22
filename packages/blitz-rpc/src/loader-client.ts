import {
  assertPosixPath,
  convertFilePathToResolverName,
  convertFilePathToResolverType,
  convertPageFilePathToRoutePath,
  Loader,
  LoaderOptions,
  toPosixPath,
} from "./loader-utils"
import {posix} from "path"

// Subset of `import type { LoaderDefinitionFunction } from 'webpack'`

export async function loader(this: Loader, input: string): Promise<string> {
  const compiler = this._compiler!
  const id = this.resource
  const root = this._compiler!.context

  const isSSR = compiler.name === "server"
  if (!isSSR) {
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
  const routePath = convertPageFilePathToRoutePath(resolverFilePath, options?.resolverPath)
  const resolverName = convertFilePathToResolverName(resolverFilePath)
  const resolverType = convertFilePathToResolverType(resolverFilePath)

  const code = `
    // @ts-nocheck
    import { __internal_buildRpcClient } from "@blitzjs/rpc";
    export default __internal_buildRpcClient({
      resolverName: "${resolverName}",
      resolverType: "${resolverType}",
      routePath: "${routePath}",
    });
  `

  return code
}
