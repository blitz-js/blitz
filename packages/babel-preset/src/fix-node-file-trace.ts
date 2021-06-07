import { PluginObj } from '@babel/core';
import { getFileName, wrapExportDefaultDeclaration } from './utils';
import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import { addNamed as addNamedImport } from '@babel/helper-module-imports';
import {
  callExpression,
  ClassDeclaration,
  classExpression,
  ExportNamedDeclaration,
  Expression,
  FunctionDeclaration,
  functionExpression,
  isClassDeclaration,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isVariableDeclaration,
  variableDeclaration,
  variableDeclarator,
  arrayExpression,
  stringLiteral,
} from '@babel/types';
import * as nodePath from 'path';

function functionDeclarationToExpression(declaration: FunctionDeclaration) {
  return functionExpression(
    declaration.id,
    declaration.params,
    declaration.body,
    declaration.generator,
    declaration.async
  );
}

function classDeclarationToExpression(declaration: ClassDeclaration) {
  return classExpression(
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

const functionsToReplace = ['getServerSideProps', 'getStaticProps'];

function transformPropGetters(
  path: NodePath<ExportNamedDeclaration>,
  transform: (v: Expression) => Expression
) {
  const { node } = path;

  if (isFunctionDeclaration(node.declaration)) {
    const { id: functionId } = node.declaration;
    if (!functionId) {
      return;
    }

    if (!functionsToReplace.includes(functionId.name)) {
      return;
    }

    node.declaration = variableDeclaration('const', [
      variableDeclarator(
        functionId,
        transform(functionDeclarationToExpression(node.declaration))
      ),
    ]);

    return;
  }

  if (isVariableDeclaration(node.declaration)) {
    node.declaration.declarations.forEach((declaration) => {
      if (
        isIdentifier(declaration.id) &&
        functionsToReplace.includes(declaration.id.name) &&
        declaration.init
      ) {
        declaration.init = transform(declaration.init);
      }
    });
  }
}

function addWithSuperJSONPropsImport(path: NodePath<any>) {
  return addNamedImport(
    path,
    'withSuperJSONProps',
    'babel-plugin-superjson-next/tools'
  );
}

const filesToSkip = ([] as string[]).concat(
  ...['_app', '_document', '_error'].map((name) => [
    name + '.js',
    name + '.jsx',
    name + '.ts',
    name + '.tsx',
  ])
);

function shouldBeSkipped(filePath: string) {
  if (!filePath.includes('pages' + nodePath.sep)) {
    return true;
  }
  if (filePath.includes('pages' + nodePath.sep + 'api')) {
    return true;
  }
  return filesToSkip.some((fileToSkip) => filePath.includes(fileToSkip));
}

function FixNodeFileTrace(): PluginObj {
  return {
    name: 'FixNodeFileTrace',
    visitor: {
      Program(path, state) {
        const propsToBeExcluded = (state.opts as any).exclude as
          | string[]
          | undefined;

        const filePath =
          getFileName(state) ?? nodePath.join('pages', 'Default.js');

        if (shouldBeSkipped(filePath)) {
          return;
        }

        const body = path.get('body');

        body
          .filter((path) => isExportNamedDeclaration(path))
          .forEach((path) => {
            transformPropGetters(
              path as NodePath<ExportNamedDeclaration>,
              (decl) => {
                return callExpression(addWithSuperJSONPropsImport(path), [
                  decl,
                  arrayExpression(
                    propsToBeExcluded?.map((prop) => stringLiteral(prop))
                  ),
                ]);
              }
            );
          });
      },
    },
  };
}

// eslint-disable-next-line import/no-default-export
export default FixNodeFileTrace;
