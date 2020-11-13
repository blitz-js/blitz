import {ResolverType} from "@blitzjs/core"
import {Stage, transform} from "@blitzjs/file-pipeline"
import {relative} from "path"
import slash from "slash"
import File from "vinyl"
import {absolutePathTransform} from "../utils"

export function isResolverPath(filePath: string) {
  return /(?:app[\\/])(?!_resolvers).*(?:queries|mutations)[\\/].+/.exec(filePath)
}

const isomorhicHandlerTemplate = (
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
) => `
import {getIsomorphicEnhancedResolver} from '@blitzjs/core'
import * as resolverModule from '${resolverFilePath}'
export default getIsomorphicEnhancedResolver(
  resolverModule,
  '${resolverFilePath}',
  '${resolverName}',
  '${resolverType}',
)
`

// Clarification: try/catch around db is to prevent query errors when not using blitz's inbuilt database (See #572)
const apiHandlerTemplate = (originalPath: string, useTypes: boolean) => `
// This imports the output of getIsomorphicEnhancedResolver()
import enhancedResolver from '${originalPath}'
import {getAllMiddlewareForModule} from '@blitzjs/core'
import {rpcApiHandler} from '@blitzjs/server'
import path from 'path'

// Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
path.resolve("next.config.js")
path.resolve("blitz.config.js")
path.resolve(".next/__db.js")
// End anti-tree-shaking

let db${useTypes ? ": any" : ""}
let connect${useTypes ? ": any" : ""}
try {
  db = require('db').default
  if (require('db').connect) {
    connect = require('db').connect
  } else if (db?.$connect || db?.connect) {
    connect = () => db.$connect ? db.$connect() : db.connect()
  } else {
    connect = () => {}
  }
} catch(_) {}

export default rpcApiHandler(
  enhancedResolver,
  getAllMiddlewareForModule(enhancedResolver),
  () => db && connect?.(),
)

export const config = {
  api: {
    externalResolver: true,
  },
}
`

/**
 * Returns a Stage that manages generating the internal RPC commands and handlers
 */
export const createStageRpc = (isTypescript = true): Stage =>
  function configure({config: {src}}) {
    const fileTransformer = absolutePathTransform(src)

    const getResolverPath = fileTransformer(resolverFilePath)
    const getApiHandlerPath = fileTransformer(apiHandlerPath)

    const stream = transform.file((file, {next, push}) => {
      if (!isResolverPath(file.path)) {
        return file
      }

      const originalPath = resolutionPath(src, file.path)
      const resolverImportPath = resolverFilePath(originalPath)
      const {resolverType, resolverName} = extractTemplateVars(resolverImportPath)

      // Original function -> _resolvers path
      push(
        new File({
          path: getResolverPath(file.path),
          contents: file.contents,
          // Appending a new file to the output of this particular stream
          // We don't want to reprocess this file but simply add it to the output
          // of the stream here we provide a hash with some information for how
          // this file came to be here
          hash: [file.hash, "rpc", "resolver"].join("|"),
          event: "add",
        }),
      )

      // File API route handler
      push(
        new File({
          path: getApiHandlerPath(file.path),
          contents: Buffer.from(apiHandlerTemplate(originalPath, isTypescript)),
          // Appending a new file to the output of this particular stream
          // We don't want to reprocess this file but simply add it to the output
          // of the stream here we provide a hash with some information for how
          // this file came to be here
          hash: [file.hash, "rpc", "handler"].join("|"),
          event: "add",
        }),
      )

      // Isomorphic client
      const isomorphicHandlerFile = file.clone()
      isomorphicHandlerFile.contents = Buffer.from(
        isomorhicHandlerTemplate(resolverImportPath, resolverName, resolverType),
      )
      push(isomorphicHandlerFile)

      return next()
    })

    return {stream}
  }

function removeExt(filePath: string) {
  return filePath.replace(/[.][^./\s]+$/, "")
}

function resolutionPath(srcPath: string, filePath: string) {
  return removeExt(slash(relative(srcPath, filePath)))
}

function extractTemplateVars(resolverImportPath: string) {
  const [, resolverTypePlural, resolverName] =
    /(queries|mutations)\/(.*)$/.exec(resolverImportPath) || []

  const resolverType: ResolverType = resolverTypePlural === "mutations" ? "mutation" : "query"

  return {
    resolverImportPath,
    resolverType,
    resolverName,
  }
}

function resolverFilePath(path: string) {
  return path.replace(/^app/, "app/_resolvers")
}

function apiHandlerPath(path: string) {
  return path.replace(/^app/, "pages/api")
}
