import {assert} from "blitz"
import {posix, sep, win32} from "path"
import {ResolverPathOptions} from "./index-server"
import j from "jscodeshift"
import getBabelOptions, {Overrides} from "recast/parsers/_babel_options"
import * as babelParser from "recast/parsers/babel"
import fs from "fs"
import path from "path"

export const customTsParser: any = {
  parse(source: string, options?: Overrides) {
    const babelOptions = getBabelOptions(options)
    babelOptions.plugins.push("typescript")
    babelOptions.plugins.push("jsx")
    return babelParser.parser.parse(source, babelOptions)
  },
}

export function getCollectionFromSource(filename: string) {
  const fileSource = fs.readFileSync(path.resolve(filename), {encoding: "utf-8"})
  return j(fileSource, {
    parser: customTsParser,
  })
}

type _ResolverType = "GET" | "POST"

export function getHttpMethodFromResolverConfig(path: string): _ResolverType {
  const collection = getCollectionFromSource(path)
  const config = collection.find(j.ExportNamedDeclaration, {
    declaration: {
      type: "VariableDeclaration",
      declarations: [
        {
          id: {
            name: "config",
          },
        },
      ],
    },
  })
  const configValue = config.find(j.ObjectExpression).filter((p) => {
    return p.value.properties.some((prop) => {
      if (prop.type === "ObjectProperty" && prop.key.type === "Identifier") {
        return prop.key.name === "httpMethod"
      }
    })
  })
  const httpMethod = configValue.find(j.StringLiteral).filter((p) => {
    return p.value.value === "GET" || p.value.value === "POST"
  })
  if (httpMethod.length > 0) {
    return httpMethod.get().value.value
  }
  return "POST"
}

export interface LoaderOptions {
  resolverPath: ResolverPathOptions
}

export interface Loader {
  _compiler?: {
    name: string
    context: string
  }
  resource: string
  cacheable: (enabled: boolean) => void
  query: LoaderOptions
}

export function assertPosixPath(path: string) {
  const errMsg = `Wrongly formatted path: ${path}`
  assert(!path.includes(win32.sep), errMsg)
  // assert(path.startsWith('/'), errMsg)
}

export function toPosixPath(path: string) {
  if (process.platform !== "win32") {
    assert(sep === posix.sep, "TODO")
    assertPosixPath(path)
    return path
  } else {
    assert(sep === win32.sep, "TODO")
    const pathPosix = path.split(win32.sep).join(posix.sep)
    assertPosixPath(pathPosix)
    return pathPosix
  }
}

export function toSystemPath(path: string) {
  path = path.split(posix.sep).join(sep)
  path = path.split(win32.sep).join(sep)
  return path
}

export const topLevelFoldersThatMayContainResolvers = ["src", "app", "integrations"]

export function buildPageExtensionRegex(pageExtensions: string[]) {
  return new RegExp(`(?<!\\.test|\\.spec)\\.(?:${pageExtensions.join("|")})$`)
}

const fileExtensionRegex = /\.([a-z]+)$/

export function convertPageFilePathToRoutePath(
  filePath: string,
  resolverPath?: ResolverPathOptions,
) {
  if (typeof resolverPath === "function") {
    return resolverPath(filePath)
  }

  if (resolverPath === "root") {
    return filePath.replace(fileExtensionRegex, "")
  }

  return filePath
    .replace(/^.*?[\\/]queries[\\/]/, "/")
    .replace(/^.*?[\\/]mutations[\\/]/, "/")
    .replace(/\\/g, "/")
    .replace(fileExtensionRegex, "")
}

export function convertFilePathToResolverName(filePathFromAppRoot: string) {
  return filePathFromAppRoot
    .replace(/^.*[\\/](queries|mutations)[\\/]/, "")
    .replace(fileExtensionRegex, "")
}

export function convertFilePathToResolverType(filePathFromAppRoot: string) {
  return filePathFromAppRoot.match(/[\\/]queries[\\/]/) ? "query" : "mutation"
}

export function getIsRpcFile(filePathFromAppRoot: string) {
  return (
    /[\\/]queries[\\/]/.test(filePathFromAppRoot) || /[\\/]mutations[\\/]/.test(filePathFromAppRoot)
  )
}
