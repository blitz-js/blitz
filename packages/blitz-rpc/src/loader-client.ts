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
import {log, ResolverConfig} from "blitz"
import {getResolverConfig} from "./parse-rpc-config"

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
