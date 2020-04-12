import File from 'vinyl'
import {transform} from '../transform'
import {absolutePathTransform} from '../path-utils'
import {relative} from 'path'
import {isRpcPath} from '../rpc-utils'

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
  return filePath.replace(/\.[^\.\/]+$/, '')
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

// function resolveRpcImports(file: File) {
//   const contents = file.contents?.toString() || ''

//   const rpcImport = new RegExp(`from \\s*["'](` + isRpcPathRegexString + `)["']`, 'g')

//   const newContents = contents.replace(rpcImport, (...args) => {
//     return `from "${clientPath(args[1])}"`
//   })

//   return new File({path: file.path, contents: Buffer.from(newContents)})
// }

function clientPath(path: string) {
  return path.replace(/^app/, 'app/_rpc')
}

function handlerPath(path: string) {
  return path.replace(/^app/, 'pages/api')
}
export function createRpcRule({srcPath}: {srcPath: string}) {
  const getRpcClientPath = absolutePathTransform(srcPath, clientPath)
  const getRpcHandlerPath = absolutePathTransform(srcPath, handlerPath)

  return transform((file: File) => {
    // const parsedFile = resolveRpcImports(file)
    if (!isRpcPath(file.path)) return [file]

    const importPath = clientPath(resolutionPath(srcPath, file.path))
    const {resolverType, resolverName} = extractTemplateVars(importPath)

    return [
      // Move file to rpc path
      new File({
        path: getRpcClientPath(file.path),
        contents: file.contents,
      }),

      // Rpc Client
      new File({
        path: file.path,
        contents: Buffer.from(isomorphicRpcTemplate(importPath)),
      }),

      // Rpc Handler
      new File({
        path: getRpcHandlerPath(file.path),
        contents: Buffer.from(rpcHandlerTemplate(importPath, resolverType, resolverName)),
      }),
    ]
  })
}
