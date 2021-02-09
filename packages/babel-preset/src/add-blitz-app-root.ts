import { NodePath, PluginObj, PluginPass, types as t } from '@babel/core';
import { addNamed as addNamedImport } from '@babel/helper-module-imports';

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

function addImport(path: NodePath<any>) {
  return addNamedImport(path, 'withBlitzAppRoot', '@blitzjs/core');
}

function wrapInHOF(
  path: NodePath<any>,
  expr: t.Expression,
  _filePath: string
): t.Expression {
  const program = path.findParent(t.isProgram) as NodePath<t.Program>;
  if (!program) throw new Error('Missing parent');

  return t.callExpression(addImport(path), [expr]);
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

function AddBlitzAppRoot(): PluginObj {
  return {
    name: 'AddBlitzAppRoot',
    visitor: {
      ExportDefaultDeclaration(path, state) {
        const filePath = getFileName(state);

        if (!filePath?.match(/_app\./)) {
          return;
        }

        wrapExportDefaultDeclaration(path, filePath);
      },
    },
  };
}

// eslint-disable-next-line import/no-default-export
export default AddBlitzAppRoot;
