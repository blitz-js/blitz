import {dirname, join, posix, relative} from "path"
import {promises} from "fs"
import {
  assertPosixPath,
  buildPageExtensionRegex,
  convertFilePathToResolverType,
  convertPageFilePathToRoutePath,
  getIsRpcFile,
  Loader,
  LoaderOptions,
  topLevelFoldersThatMayContainResolvers,
  toPosixPath,
} from "./loader-utils"
import {getResolverConfig} from "./parse-rpc-config"
import {log, ResolverConfig} from "blitz"

// Subset of `import type { LoaderDefinitionFunction } from 'webpack'`

export async function loader(this: Loader, input: string): Promise<string> {
  const compiler = this._compiler!
  const id = this.resource
  const root = this._compiler!.context

  const isSSR = compiler.name === "server"
  if (isSSR) {
    this.cacheable(false)

    const resolvers = await collectResolvers(root, ["ts", "js"])
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
    const relativeResolverPath = slash(relative(dirname(id), join(root, resolverFilePath)))
    const resolverType = convertFilePathToResolverType(resolverFilePath)
    const routePath = convertPageFilePathToRoutePath(resolverFilePath, options?.resolverPath)
    const _resolverConfig: ResolverConfig = {
      httpMethod: "POST",
    }
    if (resolverType === "query") {
      try {
        const {httpMethod} = getResolverConfig(join(root, resolverFilePath))
        if (httpMethod) {
          _resolverConfig.httpMethod = httpMethod
        }
      } catch (e) {
        log.error(e as string)
      }
    }
    const resolverConfig = JSON.stringify(_resolverConfig)
    code += `__internal_addBlitzRpcResolver('${routePath}',${resolverConfig}, () => import('${relativeResolverPath}'));`
    code += "\n"
  }
  // console.log("NEW CODE", code)
  return code
}

export function collectResolvers(directory: string, pageExtensions: string[]): Promise<string[]> {
  return recursiveFindResolvers(directory, buildPageExtensionRegex(pageExtensions))
}

export async function recursiveFindResolvers(
  dir: string,
  filter: RegExp,
  ignore?: RegExp,
  arr: string[] = [],
  rootDir: string = dir,
): Promise<string[]> {
  let folders = await promises.readdir(dir)

  if (dir === rootDir) {
    folders = folders.filter((folder) => topLevelFoldersThatMayContainResolvers.includes(folder))
  }

  await Promise.all(
    folders.map(async (part: string) => {
      const absolutePath = join(dir, part)
      if (ignore && ignore.test(part)) return

      const pathStat = await promises.stat(absolutePath)

      if (pathStat.isDirectory()) {
        await recursiveFindResolvers(absolutePath, filter, ignore, arr, rootDir)
        return
      }

      if (!filter.test(part)) {
        return
      }

      const relativeFromRoot = absolutePath.replace(rootDir, "")
      if (getIsRpcFile(relativeFromRoot)) {
        arr.push(relativeFromRoot)
        return
      }
    }),
  )

  return arr.sort()
}
