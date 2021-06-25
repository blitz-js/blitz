import { PluginObj } from 'next/dist/compiled/babel/core'
import { BabelType } from 'babel-plugin-tester'
import { convertPageFilePathToRoutePath } from '../../utils'

/* This plugin changes the file contents to this:
 *
import { buildRpcClient } from "next/data-client";
export default buildRpcClient({
  "resolverName": "getUsers",
  "routePath": "/api/rpc/getUsers"
});
 *
*/

// https://astexplorer.net/#/gist/02bab3c8f0488923346b607ed578e2f7/latest (may be out of date)

export default function blitzRpcClient(babel: BabelType): PluginObj {
  const { types: t } = babel

  return {
    visitor: {
      Program: {
        enter(path, state) {
          const { filename, cwd } = state

          const relativePathFromRoot = filename.replace(cwd, '')
          const resolverName = filename
            .replace(/^.*[\\/]/, '')
            .replace(/\.[^.]*$/, '')
          const routePath = convertPageFilePathToRoutePath(relativePathFromRoot)

          const importDeclaration = t.importDeclaration(
            [
              t.importSpecifier(
                t.identifier('buildRpcClient'),
                t.identifier('buildRpcClient')
              ),
            ],
            t.stringLiteral('next/data-client')
          )
          const exportDeclaration = t.exportDefaultDeclaration(
            t.callExpression(t.identifier('buildRpcClient'), [
              t.objectExpression([
                t.objectProperty(
                  t.stringLiteral('resolverName'),
                  t.stringLiteral(resolverName)
                ),
                t.objectProperty(
                  t.stringLiteral('routePath'),
                  t.stringLiteral(routePath)
                ),
              ]),
            ])
          )
          path.node.body = [importDeclaration, exportDeclaration]
        },
      },
    },
  }
}
