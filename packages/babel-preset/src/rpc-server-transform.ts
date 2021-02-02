import { NodePath, PluginObj, PluginPass, types as t } from '@babel/core';
import { addNamed as addNamedImport } from '@babel/helper-module-imports';
import * as nodePath from 'path';

/*
 * Probably out of date, but working AST Explorer playground with dependencies inlined:
 * https://astexplorer.net/#/gist/77689180624bb32e93745eb371f989da/55763c62f802bd0a69531e6e979b3ac446f4b821
 */

function functionDeclarationToExpression(declaration: t.FunctionDeclaration) {
  return t.functionExpression(
    declaration.id,
    declaration.params,
    declaration.body,
    declaration.generator,
    declaration.async
  );
}

function classDeclarationToExpression(declaration: t.ClassDeclaration) {
  return t.classExpression(
    declaration.id,
    declaration.superClass,
    declaration.body,
    declaration.decorators
  );
}

function getFileName(state: PluginPass) {
  const { filename, cwd } = state;

  if (!filename) {
    return undefined;
  }

  if (cwd && filename.startsWith(cwd)) {
    return filename.slice(cwd.length);
  }

  return filename;
}

function addWithSuperJSONPageImport(path: NodePath<any>) {
  return addNamedImport(path, 'enhanceResolver', '@blitzjs/core');
}

function extractResolverMetadata(filePath: string) {
  const [, typePlural, name] =
    /(queries|mutations)\/(.*)$/.exec(filePath) || [];

  const type /*: ResolverType*/ =
    typePlural === 'mutations' ? 'mutation' : 'query';

  return {
    type,
    name,
    apiPath: filePath.replace(/^\/app/, 'pages/api'),
  };
}

function wrapInHOF(
  path: NodePath<any>,
  expr: t.Expression,
  filePath: string
): t.Expression {
  const data = extractResolverMetadata(filePath);

  const program = path.findParent(t.isProgram) as NodePath<t.Program>;
  if (!program) throw new Error('Missing parent');
  const hasMiddlewareExport = program.node.body.find((path) => {
    if (!t.isExportNamedDeclaration(path)) return null;
    if (!path.declaration) return null;
    if (!t.isVariableDeclaration(path.declaration)) return null;
    const variableDeclarator = path.declaration.declarations.find((path) =>
      t.isVariableDeclarator(path)
    );
    if (!variableDeclarator) return null;
    return (variableDeclarator.id as any).name === 'middleware';
  });

  const metadataProperties = [
    t.objectProperty(t.identifier('name'), t.stringLiteral(data.name)),
    t.objectProperty(t.identifier('type'), t.stringLiteral(data.type)),
    t.objectProperty(t.identifier('filePath'), t.stringLiteral(filePath)),
  ];
  if (hasMiddlewareExport) {
    metadataProperties.push(
      t.objectProperty(t.identifier('middleware'), t.identifier('middleware'))
    );
  }
  return t.callExpression(addWithSuperJSONPageImport(path), [
    expr,
    t.objectExpression(metadataProperties),
  ]);
}

function wrapExportDefaultDeclaration(path: NodePath<any>, filePath: string) {
  const { node } = path;

  if (
    t.isIdentifier(node.declaration) ||
    t.isFunctionExpression(node.declaration) ||
    t.isCallExpression(node.declaration)
  ) {
    node.declaration = wrapInHOF(path, node.declaration, filePath);
  } else if (
    t.isFunctionDeclaration(node.declaration) ||
    t.isClassDeclaration(node.declaration)
  ) {
    if (node.declaration.id) {
      path.insertBefore(node.declaration);
      node.declaration = wrapInHOF(path, node.declaration.id, filePath);
    } else {
      if (t.isFunctionDeclaration(node.declaration)) {
        node.declaration = wrapInHOF(
          path,
          functionDeclarationToExpression(node.declaration),
          filePath
        );
      } else {
        node.declaration = wrapInHOF(
          path,
          classDeclarationToExpression(node.declaration),
          filePath
        );
      }
    }
  }
}

function RpcServerTranform(): PluginObj {
  return {
    name: 'RpcServerTranform',
    visitor: {
      ExportDefaultDeclaration(path, state) {
        const filePath =
          getFileName(state) ?? nodePath.join('pages', 'Default.js');

        if (!filePath.match(/app.*\/(queries|mutations)\//)) {
          return;
        }

        wrapExportDefaultDeclaration(path, filePath);
      },
    },
  };
}

// eslint-disable-next-line import/no-default-export
export default RpcServerTranform;
