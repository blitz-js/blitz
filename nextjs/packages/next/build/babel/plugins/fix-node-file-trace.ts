import type { NodePath, PluginObj } from 'next/dist/compiled/babel/core'
import { addNamed as addNamedImport } from '@babel/helper-module-imports'
import {
  callExpression,
  ExportNamedDeclaration,
  Expression,
  FunctionDeclaration,
  functionExpression,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isVariableDeclaration,
  variableDeclaration,
  variableDeclarator,
} from '@babel/types'
import * as nodePath from 'path'
import { getFileName, wrapExportDefaultDeclaration } from './utils'

function functionDeclarationToExpression(declaration: FunctionDeclaration) {
  return functionExpression(
    declaration.id,
    declaration.params,
    declaration.body,
    declaration.generator,
    declaration.async
  )
}

const functionsToReplace = ['getServerSideProps', 'getStaticProps']

function transformPropGetters(
  path: NodePath<ExportNamedDeclaration>,
  transform: (v: Expression) => Expression
) {
  const { node } = path

  if (isFunctionDeclaration(node.declaration)) {
    const { id: functionId } = node.declaration
    if (!functionId) {
      return
    }

    if (!functionsToReplace.includes(functionId.name)) {
      return
    }

    node.declaration = variableDeclaration('const', [
      variableDeclarator(
        functionId,
        transform(functionDeclarationToExpression(node.declaration))
      ),
    ])

    return
  }

  if (isVariableDeclaration(node.declaration)) {
    node.declaration.declarations.forEach((declaration) => {
      if (
        isIdentifier(declaration.id) &&
        functionsToReplace.includes(declaration.id.name) &&
        declaration.init
      ) {
        declaration.init = transform(declaration.init)
      }
    })
  }
}

const HOFName = 'withFixNodeFileTrace'
const importFrom = 'next/dist/server/utils'

function addWithFixNodeFileTraceImport(path: NodePath<any>) {
  return addNamedImport(path, HOFName, importFrom)
}

const pagesToSkip = ([] as string[]).concat(
  ...['_app', '_document', '_error'].map((name) => [
    name + '.js',
    name + '.jsx',
    name + '.ts',
    name + '.tsx',
  ])
)

function isPage(filePath: string) {
  if (!filePath.includes(nodePath.sep + 'pages' + nodePath.sep)) {
    return false
  }
  if (
    filePath.includes(
      nodePath.sep + 'pages' + nodePath.sep + 'api' + nodePath.sep
    )
  ) {
    return false
  }
  return !pagesToSkip.some((fileToSkip) => filePath.includes(fileToSkip))
}

function isApiRoute(filePath: string) {
  if (filePath.includes(nodePath.sep + 'api' + nodePath.sep)) {
    return true
  }
  return false
}

function FixNodeFileTrace(): PluginObj {
  return {
    name: 'FixNodeFileTrace',
    visitor: {
      Program(path, state) {
        const filePath =
          getFileName(state) ?? nodePath.join('pages', 'Default.js')

        if (isPage(filePath)) {
          const body = path.get('body')
          body
            .filter((node) => isExportNamedDeclaration(node))
            .forEach((node) => {
              transformPropGetters(
                node as NodePath<ExportNamedDeclaration>,
                (decl) => {
                  return callExpression(addWithFixNodeFileTraceImport(node), [
                    decl,
                  ])
                }
              )
            })
          return
        } else if (isApiRoute(filePath)) {
          const body = path.get('body')
          const exportDefaultDeclaration = body.find((node) =>
            isExportDefaultDeclaration(node)
          )
          if (exportDefaultDeclaration) {
            wrapExportDefaultDeclaration(
              exportDefaultDeclaration,
              HOFName,
              importFrom
            )
            return
          }
        }
      },
    },
  }
}

// eslint-disable-next-line import/no-default-export
export default FixNodeFileTrace
