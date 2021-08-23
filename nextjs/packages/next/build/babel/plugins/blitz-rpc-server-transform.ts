/* @eslint-disable no-redeclare */
import { NodePath, PluginObj, types as t } from 'next/dist/compiled/babel/core'
import { BabelType } from 'babel-plugin-tester'
// @ts-ignore
import { addNamed as addNamedImport } from '@babel/helper-module-imports'
import {
  convertPageFilePathToRoutePath,
  convertPageFilePathToResolverName,
  convertPageFilePathToResolverType,
} from '../../utils'

/* This plugin changes the file default export to be like this:
 *
 export default require('next/data-client').buildRpcResolver(
   function getUsers(input) {
     return db.users.findMany()
   },
   {
    "resolverName": "getUsers",
    "resolverType": "query",
    "routePath": "/api/rpc/getUsers"
  }
  );
 *
*/

function functionDeclarationToExpression(declaration: t.FunctionDeclaration) {
  return t.functionExpression(
    declaration.id,
    declaration.params,
    declaration.body,
    declaration.generator,
    declaration.async
  )
}

function classDeclarationToExpression(declaration: t.ClassDeclaration) {
  return t.classExpression(
    declaration.id,
    declaration.superClass,
    declaration.body,
    declaration.decorators
  )
}

function addBuildRpcResolverImport(path: NodePath<any>) {
  return addNamedImport(path, 'buildRpcResolver', 'next/data-client')
}

function wrapInHOF(
  path: NodePath<any>,
  expr: t.Expression,
  { routePath, resolverName, resolverType }: Metadata
): t.Expression {
  const program = path.findParent(t.isProgram) as NodePath<t.Program>
  if (!program) throw new Error('Missing parent')
  const hasMiddlewareExport = program.node.body.find((path) => {
    if (!t.isExportNamedDeclaration(path)) return null
    if (!path.declaration) return null
    if (!t.isVariableDeclaration(path.declaration)) return null
    const variableDeclarator = path.declaration.declarations.find((path) =>
      t.isVariableDeclarator(path)
    )
    if (!variableDeclarator) return null
    return (variableDeclarator.id as any).name === 'middleware'
  })

  const metadataProperties = [
    t.objectProperty(
      t.stringLiteral('resolverName'),
      t.stringLiteral(resolverName)
    ),
    t.objectProperty(
      t.stringLiteral('resolverType'),
      t.stringLiteral(resolverType)
    ),
    t.objectProperty(t.stringLiteral('routePath'), t.stringLiteral(routePath)),
  ]
  if (hasMiddlewareExport) {
    metadataProperties.push(
      t.objectProperty(t.identifier('middleware'), t.identifier('middleware'))
    )
  }
  return t.callExpression(addBuildRpcResolverImport(path), [
    expr,
    t.objectExpression(metadataProperties),
  ])
}

function wrapExportDefaultDeclaration(path: NodePath<any>, metadata: Metadata) {
  const { node } = path

  if (
    t.isIdentifier(node.declaration) ||
    t.isFunctionExpression(node.declaration) ||
    t.isCallExpression(node.declaration)
  ) {
    node.declaration = wrapInHOF(path, node.declaration, metadata)
  } else if (
    t.isFunctionDeclaration(node.declaration) ||
    t.isClassDeclaration(node.declaration)
  ) {
    if (node.declaration.id) {
      path.insertBefore(node.declaration)
      node.declaration = wrapInHOF(path, node.declaration.id, metadata)
    } else {
      if (t.isFunctionDeclaration(node.declaration)) {
        node.declaration = wrapInHOF(
          path,
          functionDeclarationToExpression(node.declaration),
          metadata
        )
      } else {
        node.declaration = wrapInHOF(
          path,
          classDeclarationToExpression(node.declaration),
          metadata
        )
      }
    }
  }
}

interface Metadata {
  routePath: string
  resolverName: string
  resolverType: string
}

const fileExtensionRegex = /\.([a-z]+)$/

export default function blitzRpcServerTransform(_babel: BabelType): PluginObj {
  return {
    visitor: {
      ExportDefaultDeclaration(path, state) {
        const { filename, cwd } = state
        const fileExt = fileExtensionRegex.exec(filename)?.[1] || 'unknown'

        const relativePathFromRoot = filename.replace(cwd, '')
        const resolverName = convertPageFilePathToResolverName(
          relativePathFromRoot
        )
        const resolverType = convertPageFilePathToResolverType(
          relativePathFromRoot
        )
        const routePath = convertPageFilePathToRoutePath(relativePathFromRoot, [
          fileExt as string,
        ])

        wrapExportDefaultDeclaration(path, {
          resolverName,
          resolverType,
          routePath,
        })
      },
    },
  }
}
