import File from 'vinyl'
import slash from 'slash'
import {absolutePathTransform} from '../utils'
import {relative} from 'path'
import {Stage, transform} from '@blitzjs/file-pipeline'

/**
 * Returns a Stage that manages generating the internal RPC commands and handlers
 */
export const createStageRpc: Stage = function configure({config: {src}}) {
  const fileTransformer = absolutePathTransform(src)

  const getRpcPath = fileTransformer(rpcPath)
  const getRpcHandlerPath = fileTransformer(handlerPath)

  const stream = transform.file((file, {next, push}) => {
    if (!isRpcPath(file.path)) {
      return file
    }

    const importPath = rpcPath(resolutionPath(src, file.path))
    const {resolverType, resolverName} = extractTemplateVars(importPath)

    // Original function -> _rpc path
    push(
      new File({
        path: getRpcPath(file.path),
        contents: file.contents,
        hash: file.hash + ':1',
      }),
    )

    // File API route handler
    push(
      new File({
        path: getRpcHandlerPath(file.path),
        contents: Buffer.from(rpcHandlerTemplate(importPath, resolverType, resolverName)),
        hash: file.hash + ':2',
      }),
    )

    // Isomorphic RPC client
    const rpcFile = file.clone()
    rpcFile.contents = Buffer.from(isomorphicRpcTemplate(importPath, resolverType, resolverName))
    push(rpcFile)

    return next()
  })

  return {stream}
}

export function isRpcPath(filePath: string) {
  return /(?:app[\\/])(?!_rpc).*(?:queries|mutations)[\\/].+/.exec(filePath)
}

const isomorphicRpcTemplate = (resolverPath: string, resolverType: string, resolverName: string) => `
import {getIsomorphicRpcHandler} from '@blitzjs/core'
const resolverModule = require('${resolverPath}')
export default getIsomorphicRpcHandler(
  resolverModule,
  '${resolverPath}',
  '${resolverName}',
  '${resolverType}'
) as typeof resolverModule.default
`

// Clarification: try/catch around db is to prevent query errors when not using blitz's inbuilt database (See #572)
const rpcHandlerTemplate = (resolverPath: string, resolverType: string, resolverName: string) => `
import {rpcApiHandler, getAllMiddlewareForModule} from '@blitzjs/server'
const resolverModule = require('${resolverPath}')
let db
try {
  db = require('db').default
}catch(err){}
export default rpcApiHandler(
  '${resolverType}',
  '${resolverName}',
  resolverModule.default,
  getAllMiddlewareForModule('${resolverName}', resolverModule),
  () => db && db.connect(),
)
export const config = {
  api: {
    externalResolver: true,
  },
}
`

function removeExt(filePath: string) {
  return filePath.replace(/[.][^./\s]+$/, '')
}

function resolutionPath(srcPath: string, filePath: string) {
  return removeExt(slash(relative(srcPath, filePath)))
}

function extractTemplateVars(importPath: string) {
  const [, resolverTypePlural, resolverName] = /(queries|mutations)\/(.*)$/.exec(importPath) || []

  return {
    importPath,
    resolverType: resolverTypePlural === 'mutations' ? 'mutation' : 'query',
    resolverName,
  }
}

function rpcPath(path: string) {
  return path.replace(/^app/, 'app/_rpc')
}

function handlerPath(path: string) {
  return path.replace(/^app/, 'pages/api')
}
