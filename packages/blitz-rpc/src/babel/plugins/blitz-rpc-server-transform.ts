/* @eslint-disable no-redeclare */
import {NodePath, PluginObj, types as t} from "@babel/core"
import {BabelType} from "babel-plugin-tester"
// @ts-ignore
import {addNamed as addNamedImport} from "@babel/helper-module-imports"

/* This plugin changes the file default export to be like this:
 *
 export default require('@blitzjs/rpc').__internal_addBlitzRpcResolver(
   function getUsers(input) {
     return db.users.findMany()
     },
     {filePath:'app/queries/getUsers.ts'}
  );
 *
*/

function functionDeclarationToExpression(declaration: t.FunctionDeclaration) {
  return t.functionExpression(
    declaration.id,
    declaration.params,
    declaration.body,
    declaration.generator,
    declaration.async,
  )
}

function classDeclarationToExpression(declaration: t.ClassDeclaration) {
  return t.classExpression(
    declaration.id,
    declaration.superClass,
    declaration.body,
    declaration.decorators,
  )
}

function addBuildRpcResolverImport(path: NodePath<any>) {
  return addNamedImport(path, "__internal_addBlitzRpcResolver", "@blitzjs/rpc")
}

function wrapInHOF(path: NodePath<any>, expr: t.Expression, {filePath}: Metadata): t.Expression {
  const program = path.findParent(t.isProgram) as NodePath<t.Program>
  if (!program) throw new Error("Missing parent")
  // eslint-disable-next-line no-shadow

  const metadataProperties = [
    t.objectProperty(t.stringLiteral("filePath"), t.stringLiteral(filePath)),
  ]
  return t.callExpression(addBuildRpcResolverImport(path), [
    expr,
    t.objectExpression(metadataProperties),
  ])
}

function wrapExportDefaultDeclaration(path: NodePath<any>, metadata: Metadata) {
  const {node} = path

  if (
    t.isIdentifier(node.declaration) ||
    t.isFunctionExpression(node.declaration) ||
    t.isCallExpression(node.declaration)
  ) {
    node.declaration = wrapInHOF(path, node.declaration, metadata)
  } else if (t.isFunctionDeclaration(node.declaration) || t.isClassDeclaration(node.declaration)) {
    if (node.declaration.id) {
      path.insertBefore(node.declaration)
      node.declaration = wrapInHOF(path, node.declaration.id, metadata)
    } else {
      if (t.isFunctionDeclaration(node.declaration)) {
        node.declaration = wrapInHOF(
          path,
          functionDeclarationToExpression(node.declaration),
          metadata,
        )
      } else {
        node.declaration = wrapInHOF(path, classDeclarationToExpression(node.declaration), metadata)
      }
    }
  }
}

interface Metadata {
  filePath: string
}

// const fileExtensionRegex = /\.([a-z]+)$/

export default function blitzRpcServerTransform(_babel: BabelType): PluginObj {
  return {
    visitor: {
      ExportDefaultDeclaration(path, state) {
        const {opts, cwd} = state
        const filePath = (opts as any).filePath
        if (!filePath) throw new Error("[blitz-rpc-server-transform] filePath is empty")

        wrapExportDefaultDeclaration(path, {
          filePath: filePath,
        })
      },
    },
  }
}
