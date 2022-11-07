import {dirname, join, relative} from "path"
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
} from "./loader-utils"

// Subset of `import type { LoaderDefinitionFunction } from 'webpack'`

export async function loader(this: Loader, input: string): Promise<string> {
  const compiler = this._compiler!
  const id = this.resource
  const root = this._compiler!.context
  const rpcFolders = this.query.includeRPCFolders

  const isSSR = compiler.name === "server"
  if (isSSR) {
    this.cacheable(false)

    const resolvers = await collectResolvers(root, rpcFolders, ["ts", "js"])
    return await transformBlitzRpcServer(
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
    let relativeResolverPath = slash(relative(dirname(id), join(root, resolverFilePath)))
    const routePath = convertPageFilePathToRoutePath(resolverFilePath, options?.resolverPath)

    relativeResolverPath = relativeResolverPath.replace("../../../", "/")

    code += `__internal_addBlitzRpcResolver('${routePath}',() => import('${relativeResolverPath}'));`
    code += "\n"
  }
  // console.log("NEW CODE", code)
  return code
}

export function collectResolvers(directory: string, rpcFolders: string[], pageExtensions: string[]): Promise<string[]> {
  return recursiveFindResolvers(directory, rpcFolders, buildPageExtensionRegex(pageExtensions))
}

export async function recursiveFindResolvers(
  dir: string,
  rpcFolders: string[],
  filter: RegExp,
  ignore?: RegExp,
  arr: string[] = [],
  rootDir: string = dir,
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
        await recursiveFindResolvers(absolutePath, rpcFolders, filter, ignore, arr, rootDir)
        return
      }

      if (!filter.test(part)) {
        return
      }

      let relativeFromRoot = absolutePath.replace(rootDir, "")     

      if (getIsRpcFile(relativeFromRoot)) {
        if (!relativeFromRoot.includes("@blitzjs")) {      
          arr.push(relativeFromRoot)
          return
        }
      }
    }),
  )

  return arr.sort()
}
