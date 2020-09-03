import {Stage, transform} from "@blitzjs/file-pipeline"
import {relative} from "path"
import slash from "slash"
import File from "vinyl"
import {absolutePathTransform} from "../utils"

export function isResolverPath(filePath: string) {
  return /(?:app[\\/])(?!_resolvers).*(?:queries|mutations)[\\/].+/.exec(filePath)
}

const isomorhicHandlerTemplate = (
  resolverPath: string,
  resolverName: string,
  resolverType: string,
  useTypes: boolean = true,
) => `
import {getIsomorphicRpcHandler} from '@blitzjs/core'
const resolverModule = require('${resolverPath}')
export default getIsomorphicRpcHandler(
  resolverModule,
  '${resolverPath}',
  '${resolverName}',
  '${resolverType}',
) ${useTypes ? "as typeof resolverModule.default" : ""}
`

// Clarification: try/catch around db is to prevent query errors when not using blitz's inbuilt database (See #572)
const apiHandlerTemplate = (originalPath: string, useTypes: boolean) => `
// This imports the isomorphicHandler
import resolverModule from '${originalPath}'
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
  connect = require('db').connect ?? (() => db.$connect ? db.$connect() : db.connect())
}catch(err){}
export default rpcApiHandler(
  resolverModule,
  getAllMiddlewareForModule(resolverModule),
  () => db && connect(),
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
export const createStageRpc: Stage = function configure({config: {src, isTypescript = true}}) {
  const fileTransformer = absolutePathTransform(src)

  const getResolverPath = fileTransformer(resolverPath)
  const getApiHandlerPath = fileTransformer(apiHandlerPath)

  const stream = transform.file((file, {next, push}) => {
    if (!isResolverPath(file.path)) {
      return file
    }

    const originalPath = resolutionPath(src, file.path)
    const resolverImportPath = resolverPath(originalPath)
    const {resolverType, resolverName} = extractTemplateVars(resolverImportPath)

    // Original function -> _resolvers path
    push(
      new File({
        path: getResolverPath(file.path),
        contents: file.contents,
        hash: file.hash + ":1",
      }),
    )

    // File API route handler
    push(
      new File({
        path: getApiHandlerPath(file.path),
        contents: Buffer.from(apiHandlerTemplate(originalPath, isTypescript)),
        hash: file.hash + ":2",
      }),
    )

    // Isomorphic client
    const isomorphicHandlerFile = file.clone()
    isomorphicHandlerFile.contents = Buffer.from(
      isomorhicHandlerTemplate(resolverImportPath, resolverName, resolverType, isTypescript),
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

  return {
    resolverImportPath,
    resolverType: resolverTypePlural === "mutations" ? "mutation" : "query",
    resolverName,
  }
}

function resolverPath(path: string) {
  return path.replace(/^app/, "app/_resolvers")
}

function apiHandlerPath(path: string) {
  return path.replace(/^app/, "pages/api")
}
