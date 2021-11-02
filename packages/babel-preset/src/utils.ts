import { NodePath, PluginPass, types as t } from '@babel/core';
import { addNamed as addNamedImport } from '@babel/helper-module-imports';
import type { VisitNode, Visitor } from '@babel/traverse';

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

export function wrapDefaultExportWithBlitzRoot(
  exportDefaultPath: NodePath<t.ExportDefaultDeclaration>
) {
  let found: NodePath<unknown> | undefined;

  const findArgument: VisitNode<{}, any> = (path) => {
    const parentNode = path.parent;
    if (
      parentNode.type === 'ExportDefaultDeclaration' ||
      (parentNode.type === 'CallExpression' &&
        // @todo We only support App passed as first argument.
        parentNode.arguments[0] === path.node)
    ) {
      found = path;
      path.stop();
    }
  };

  const visitor: Visitor<{}> = {
    Identifier: findArgument,
    FunctionExpression: findArgument,
    ArrowFunctionExpression: findArgument,
    ClassExpression: findArgument,
  };

  exportDefaultPath.traverse(visitor);

  if (!found) {
    wrapExportDefaultDeclaration(
      exportDefaultPath,
      'withBlitzAppRoot',
      'next/stdlib'
    );
    return;
  }

  if (found.isExpression()) {
    if (found.isIdentifier()) {
      const identifier = found;
      const body = [
        ...exportDefaultPath.getAllPrevSiblings(),
        ...exportDefaultPath.getAllNextSiblings(),
      ];

      const declaration = body.find(({ node }) => {
        return (
          node.type === 'VariableDeclaration' &&
          node.declarations[0].id.type === 'Identifier' &&
          node.declarations[0].id.name === identifier.node.name
        );
      });

      declaration?.traverse(visitor); // visitor reassigns `found`
    }

    found.replaceWith(
      t.callExpression(
        addNamedImport(
          exportDefaultPath as NodePath,
          'withBlitzAppRoot',
          'next/stdlib'
        ),
        [found.node]
      )
    );
  }
}
