import File from 'vinyl'
import slash from 'slash'
import {absolutePathTransform} from '../utils'
import {relative} from 'path'
import {through} from '../../streams'
import {Stage} from '@blitzjs/file-pipeline'

/**
 * Returns a Stage that manages generating the internal RPC commands and handlers
 */
export const createStageRpc: Stage = function configure({config: {src}}) {
  const fileTransformer = absolutePathTransform(src)

  const getRpcPath = fileTransformer(rpcPath)
  const getRpcHandlerPath = fileTransformer(handlerPath)

  const stream = through({objectMode: true}, function (file, _, next) {
    if (!isRpcPath(file.path)) {
      next(null, file)
      return
    }

    const importPath = rpcPath(resolutionPath(src, file.path))
    const {resolverType, resolverName} = extractTemplateVars(importPath)

    // Original function -> _rpc path
    this.push(
      new File({
        path: getRpcPath(file.path),
        contents: file.contents,
        hash: file.hash + ':1',
      }),
    )

    // File API route handler
    this.push(
      new File({
        path: getRpcHandlerPath(file.path),
        contents: Buffer.from(rpcHandlerTemplate(importPath, resolverType, resolverName)),
        hash: file.hash + ':2',
      }),
    )

    // Isomorphic RPC client
    const rpcFile = file.clone()
    rpcFile.contents = Buffer.from(isomorphicRpcTemplate(importPath))
    this.push(rpcFile)

    next()
  })

  return {stream}
}

export function isRpcPath(filePath: string) {
  return /(?:app[\\/])(?!_rpc).*(?:queries|mutations)[\\/].+/.exec(filePath)
}

const isomorphicRpcTemplate = (resolverPath: string) => `
import {isomorphicRpc} from '@blitzjs/core'
import resolver from '${resolverPath}'
export default isomorphicRpc(resolver, '${resolverPath}') as typeof resolver
`

// Clarification: try/catch around db is to prevent query errors when not using blitz's inbuilt database (See #572)
const rpcHandlerTemplate = (resolverPath: string, resolverType: string, resolverName: string) => `
import {rpcHandler} from '@blitzjs/server'
import resolver from '${resolverPath}'
let db
try {
  db = require('db')
}catch(err){}
export default rpcHandler('${resolverType}', '${resolverName}', resolver, () => db && db.connect())
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
