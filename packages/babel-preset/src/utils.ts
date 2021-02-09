import { NodePath, PluginPass, types as t } from '@babel/core';
import { addNamed as addNamedImport } from '@babel/helper-module-imports';

export function functionDeclarationToExpression(
  declaration: t.FunctionDeclaration
) {
  return t.functionExpression(
    declaration.id,
    declaration.params,
    declaration.body,
    declaration.generator,
    declaration.async
  );
}

export function classDeclarationToExpression(declaration: t.ClassDeclaration) {
  return t.classExpression(
    declaration.id,
    declaration.superClass,
    declaration.body,
    declaration.decorators
  );
}

export function getFileName(state: PluginPass) {
  const { filename, cwd } = state;

  if (!filename) {
    return undefined;
  }

  if (cwd && filename.startsWith(cwd)) {
    return filename.slice(cwd.length);
  }

  return filename;
}

export function wrapExportDefaultDeclaration(
  path: NodePath<any>,
  HOFName: string,
  importFrom: string
) {
  function wrapInHOF(path: NodePath<any>, expr: t.Expression) {
    return t.callExpression(addNamedImport(path, HOFName, importFrom), [expr]);
  }

  const { node } = path;

  if (
    t.isIdentifier(node.declaration) ||
    t.isFunctionExpression(node.declaration) ||
    t.isCallExpression(node.declaration)
  ) {
    node.declaration = wrapInHOF(path, node.declaration);
  } else if (
    t.isFunctionDeclaration(node.declaration) ||
    t.isClassDeclaration(node.declaration)
  ) {
    if (node.declaration.id) {
      path.insertBefore(node.declaration);
      node.declaration = wrapInHOF(path, node.declaration.id);
    } else {
      if (t.isFunctionDeclaration(node.declaration)) {
        node.declaration = wrapInHOF(
          path,
          functionDeclarationToExpression(node.declaration)
        );
      } else {
        node.declaration = wrapInHOF(
          path,
          classDeclarationToExpression(node.declaration)
        );
      }
    }
  }
}
