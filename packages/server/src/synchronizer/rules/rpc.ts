import File from 'vinyl'
import {absolutePathTransform} from './path-utils'
import {relative} from 'path'
import {Rule} from '../types'

type Args = {srcPath: string}

export default function rpc({srcPath}: Args): Rule {
  const fileTransformer = absolutePathTransform(srcPath)
  const getRpcPath = fileTransformer(rpcPath)
  const getRpcHandlerPath = fileTransformer(handlerPath)

  return (file: File) => {
    if (!isRpcPath(file.path)) return [file]

    const importPath = rpcPath(resolutionPath(srcPath, file.path))
    const {resolverType, resolverName} = extractTemplateVars(importPath)

    return [
      // Original function -> _rpc path
      new File({
        path: getRpcPath(file.path),
        contents: file.contents,
      }),

      // Replace function with Rpc Client
      new File({
        path: file.path,
        contents: Buffer.from(isomorphicRpcTemplate(importPath)),
      }),

      // Create Rpc Route Handler
      new File({
        path: getRpcHandlerPath(file.path),
        contents: Buffer.from(rpcHandlerTemplate(importPath, resolverType, resolverName)),
      }),
    ]
  }
}

export function isRpcPath(filePath: string) {
  return new RegExp('(?:app\\/).*(?:queries|mutations)\\/.+').exec(filePath)
}

const isomorphicRpcTemplate = (resolverPath: string) => `
import {isomorphicRpc} from '@blitzjs/core'

import resolver from '${resolverPath}'

export default isomorphicRpc(resolver, '${resolverPath}') as typeof resolver
`

const rpcHandlerTemplate = (resolverPath: string, resolverType: string, resolverName: string) => `
import {rpcHandler} from '@blitzjs/core'
import resolver from '${resolverPath}'
import db from 'prisma'

export default rpcHandler('${resolverType}', '${resolverName}', resolver, () => db.connect())
`

function removeExt(filePath: string) {
  return filePath.replace(/[.][^./\s]+$/, '')
}

function resolutionPath(srcPath: string, filePath: string) {
  return removeExt(relative(srcPath, filePath))
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
