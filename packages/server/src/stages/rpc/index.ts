import {getConfig} from "@blitzjs/config"
import {ResolverType} from "@blitzjs/core"
import {Stage, transform} from "@blitzjs/file-pipeline"
import {existsSync} from "fs"
import {relative} from "path"
import slash from "slash"
import File from "vinyl"
import {absolutePathTransform} from "../utils"
const debug = require("debug")("blitz:stage:rpc")

export const resolverFullBuildPathRegex = /[\\/]app[\\/]_resolvers[\\/]/
export const resolverBuildFolderReplaceRegex = /_resolvers[\\/]/g
export const resolverPathRegex = /(?:app[\\/])(?!_resolvers).*(?:queries|mutations)[\\/].+/

export function isResolverPath(filePath: string) {
  return resolverPathRegex.exec(filePath)
}

const isomorhicHandlerTemplateClient = (
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  warmApiEndpoints: boolean,
) => `
import {getIsomorphicEnhancedResolver} from '@blitzjs/core'
export * from '${resolverFilePath}'
export default getIsomorphicEnhancedResolver(
  undefined,
  '${resolverFilePath}',
  '${resolverName}',
  '${resolverType}',
  undefined,
  {
    warmApiEndpoints: ${warmApiEndpoints}
  }
)
`

const isomorhicHandlerTemplateServer = (
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  warmApiEndpoints: boolean,
) => `
import {getIsomorphicEnhancedResolver} from '@blitzjs/core'
import * as resolverModule from '${resolverFilePath}'
export * from '${resolverFilePath}'
export default getIsomorphicEnhancedResolver(
  resolverModule,
  '${resolverFilePath}',
  '${resolverName}',
  '${resolverType}',
  undefined,
  {
    warmApiEndpoints: ${warmApiEndpoints}
  }
)
`

const apiHandlerTemplate = (originalPath: string, useTypes: boolean, useDb: boolean) => `
// This imports the output of getIsomorphicEnhancedResolver()
import enhancedResolver from '${originalPath}'
import {getAllMiddlewareForModule} from '@blitzjs/core/server'
import {rpcApiHandler} from '@blitzjs/core/server'
import path from 'path'

// Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
path.resolve("next.config.js")
path.resolve(".blitz/blitz.config.js")
path.resolve(".next/blitz/db.js")
// End anti-tree-shaking

let db${useTypes ? ": any" : ""}
let connect${useTypes ? ": any" : ""}

${
  useDb
    ? `
db = require('db').default
if (require('db').connect) {
  connect = require('db').connect
} else if (db?.$connect || db?.connect) {
  connect = () => db.$connect ? db.$connect() : db.connect()
} else {
  connect = () => {}
}`
    : ""
}

export default rpcApiHandler(
  enhancedResolver,
  getAllMiddlewareForModule(enhancedResolver),
  () => db && connect?.(),
)

export const config = {
  ...enhancedResolver.config,
  api: {
    ...enhancedResolver.config?.["api"],
    externalResolver: true,
  },
}
`

/**
 * Returns a Stage that manages generating the internal RPC commands and handlers
 */
export const createStageRpc = (isTypeScript = true): Stage =>
  function configure({config: {src}}) {
    const fileTransformer = absolutePathTransform(src)

    const getResolverPath = fileTransformer(resolverFilePath)
    const getApiHandlerPath = fileTransformer(apiHandlerPath)

    const {target}: {target?: string} = getConfig()
    const warmApiEndpoints = target?.includes("serverless") ?? false

    const stream = transform.file((file, {next, push}) => {
      if (!isResolverPath(file.path)) {
        return file
      }

      debug("Event:", file.event)

      const originalPath = resolutionPath(src, file.path)
      const resolverImportPath = resolverFilePath(originalPath)
      const {resolverType, resolverName} = extractTemplateVars(resolverImportPath)

      // Isomorphic client - original file path
      push(
        new File({
          path: file.path,
          contents: Buffer.from(
            isomorhicHandlerTemplateServer(
              resolverImportPath,
              resolverName,
              resolverType,
              warmApiEndpoints,
            ),
          ),
          event: file.event,
        }),
      )

      push(
        new File({
          path: getResolverPath(file.path),
          contents: file.contents,
          // Appending a new file to the output of this particular stream
          // We don't want to reprocess this file but simply add it to the output
          // of the stream here we provide a hash with some information for how
          // this file came to be here
          hash: [file.hash, "rpc", "resolver"].join("|"),
          event: file.event,
        }),
      )

      // File API route handler
      if (["add", "unlink"].includes(file.event)) {
        push(
          new File({
            path: getApiHandlerPath(file.path),
            contents: Buffer.from(
              apiHandlerTemplate(
                originalPath,
                isTypeScript,
                existsSync(`db/index.${isTypeScript ? "ts" : "js"}`),
              ),
            ),
            // Appending a new file to the output of this particular stream
            // We don't want to reprocess this file but simply add it to the output
            // of the stream here we provide a hash with some information for how
            // this file came to be here
            hash: [file.hash, "rpc", "handler"].join("|"),
            event: file.event === "add" ? "add" : "unlink",
            originalPath: file.path,
            originalRelative: file.relative,
          }),
        )
      }

      // Isomorphic client with export
      if (["add", "unlink"].includes(file.event)) {
        // For some reason, setting `clientWithExport.basename` doesn't work like it should
        // so we have to set the basename with this temp file
        const temp = new File({path: file.path})
        temp.basename = clientResolverBasename(temp.basename)
        const clientWithExport = new File({
          path: temp.path,
          contents: Buffer.from(
            isomorhicHandlerTemplateClient(
              resolverImportPath,
              resolverName,
              resolverType,
              warmApiEndpoints,
            ),
          ),
          hash: [file.hash, "rpc", "client"].join("|"),
          event: file.event === "add" ? "add" : "unlink",
          originalPath: file.path,
          originalRelative: file.relative,
        })
        push(clientWithExport)
      }

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

/**
 * "query.ts" => "query.client.ts"
 */
function clientResolverBasename(basename: string) {
  const parts = basename.split(".")

  parts.splice(parts.length - 1, 0, "client")

  return parts.join(".")
}
