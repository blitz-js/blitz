import {join, relative} from "path"
import {promises} from "fs"
import {
  assertPosixPath,
  buildPageExtensionRegex,
  convertPageFilePathToRoutePath,
  getIsRpcFile,
  Loader,
  LoaderOptions,
  topLevelFoldersThatMayContainResolvers,
  toPosixPath,
} from "../utils/loader-utils"

// Subset of `import type { LoaderDefinitionFunction } from 'webpack'`

export async function loader(this: Loader, input: string): Promise<string> {
  const id = this.resource
  const root = this.rootContext
  const rpcFolders = this.query.includeRPCFolders ? this.query.includeRPCFolders : []

  // Webpack has `_compiler` property. Turbopack does not.
  const webpackCompilerName = this._compiler?.name
  if (webpackCompilerName) {
    const isSSR = webpackCompilerName === "server"
    if (isSSR) {
      this.cacheable(false)

      const resolvers = await collectResolvers(root, rpcFolders, ["ts", "js", "tsx", "jsx"])

      return await transformBlitzRpcServer(
        this.context,
        input,
        toPosixPath(id),
        toPosixPath(root),
        resolvers,
        this.query,
      )
    }
    // Handle Turbopack / other bundlers case.
    // The decision of which environment to run the loader in is decided by the loader configuration instead.
  } else {
    this.cacheable(false)

    const resolvers = await collectResolvers(root, rpcFolders, ["ts", "js", "tsx", "jsx"])

    return await transformBlitzRpcServer(
      this.context,
      input,
      toPosixPath(id),
      toPosixPath(root),
      resolvers,
      this.query,
    )
  }

  return input
}

module.exports = loader

function slash(str: string) {
  return str.replace(/\\/g, "/")
}

export async function transformBlitzRpcServer(
  context: string,
  src: string,
  id: string,
  root: string,
  resolvers: string[],
  options?: LoaderOptions,
) {
  assertPosixPath(id)
  assertPosixPath(root)

  const blitzImport = 'import { __internal_addBlitzRpcResolver } from "@blitzjs/rpc";'
  // No break line between `blitzImport` and `src` in order to preserve the source map's line mapping
  let code = blitzImport + src
  code += "\n\n"
  for (let resolverFilePath of resolvers) {
    const routePath = convertPageFilePathToRoutePath({
      appRoot: root,
      absoluteFilePath: resolverFilePath,
      resolverBasePath: options?.resolverPath,
      extraRpcBasePaths: options?.includeRPCFolders,
    })

    const importStrategy = options?.resolversDynamicImport ? "import" : "require"

    code += `__internal_addBlitzRpcResolver('${routePath}','${slash(
      resolverFilePath,
    )}',() => ${importStrategy}('${slash(relative(context, resolverFilePath).replace(/\\/g, "/")}'));`
    code += "\n"
  }

  return code
}

export function collectResolvers(
  directory: string,
  rpcFolders: string[],
  pageExtensions: string[],
): Promise<string[]> {
  return recursiveFindResolvers(
    directory,
    buildPageExtensionRegex(pageExtensions),
    undefined,
    [],
    directory,
    rpcFolders,
  )
}

export async function recursiveFindResolvers(
  dir: string,
  filter: RegExp,
  ignore?: RegExp,
  arr: string[] = [],
  rootDir: string = dir,
  rpcFolders: string[] = [],
): Promise<string[]> {
  let folders = await promises.readdir(dir)

  if (dir === rootDir) {
    folders = folders.filter((folder) => topLevelFoldersThatMayContainResolvers.includes(folder))
    folders.push(...rpcFolders)
  }

  await Promise.all(
    folders.map(async (part: string) => {
      const absolutePath = join(dir, part)
      if (ignore && ignore.test(part)) return

      const pathStat = await promises.stat(absolutePath)

      if (pathStat.isDirectory()) {
        if (!absolutePath.includes("node_modules")) {
          await recursiveFindResolvers(absolutePath, filter, ignore, arr, rootDir)
          return
        }
      }

      if (!filter.test(part)) {
        return
      }

      if (getIsRpcFile(absolutePath)) {
        arr.push(absolutePath)
        return
      }
    }),
  )

  return arr.sort()
}
