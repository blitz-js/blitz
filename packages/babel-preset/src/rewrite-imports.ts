import { PluginObj } from '@babel/core';
import { BabelType } from 'babel-plugin-tester';

/*
 * https://astexplorer.net/#/gist/dd0cdbd56a701d8c9e078d20505b3980/latest
 */

const defaultImportSource = '@blitzjs/core';

const specialImports: Record<string, string> = {
  Image: 'next/image',
  Script: 'next/script',

  AuthenticationError: 'next/stdlib',
  AuthorizationError: 'next/stdlib',
  CSRFTokenMismatchError: 'next/stdlib',
  NotFoundError: 'next/stdlib',
  PaginationArgumentError: 'next/stdlib',
  RedirectError: 'next/stdlib',

  Head: '@blitzjs/core/head',

  App: '@blitzjs/core/app',

  dynamic: '@blitzjs/core/dynamic',
  noSSR: '@blitzjs/core/dynamic',

  getConfig: '@blitzjs/core/config',
  setConfig: '@blitzjs/core/config',

  Document: '@blitzjs/core/document',
  DocumentHead: '@blitzjs/core/document',
  Html: '@blitzjs/core/document',
  Main: '@blitzjs/core/document',
  BlitzScript: '@blitzjs/core/document',

  getAllMiddlewareForModule: '@blitzjs/core/server',
  handleRequestWithMiddleware: '@blitzjs/core/server',
  connectMiddleware: '@blitzjs/core/server',
  invokeWithMiddleware: '@blitzjs/core/server',
  paginate: '@blitzjs/core/server',
  resolver: '@blitzjs/core/server',
  isLocalhost: '@blitzjs/core/server',
  passportAuth: '@blitzjs/core/server',
  sessionMiddleware: '@blitzjs/core/server',
  simpleRolesIsAuthorized: '@blitzjs/core/server',
  getSession: '@blitzjs/core/server',
  SecurePassword: '@blitzjs/core/server',
  hash256: '@blitzjs/core/server',
  generateToken: '@blitzjs/core/server',
  rpcApiHandler: '@blitzjs/core/server',
  setPublicDataForUser: '@blitzjs/core/server',
};

function RewriteImports(babel: BabelType): PluginObj {
  const { types: t } = babel;

  return {
    name: 'RewriteImports',
    visitor: {
      ImportDeclaration(path) {
        if (
          !looksLike(path, {
            node: {
              source: { value: 'blitz' },
            },
          })
        ) {
          return;
        }

        path.node.source = t.stringLiteral(defaultImportSource);

        const specifierIndexesToRemove: number[] = [];
        path.node.specifiers.slice().forEach((specifier, index) => {
          if (!t.isImportSpecifier(specifier)) return;
          const importedName = t.isStringLiteral(specifier.imported)
            ? specifier.imported.value
            : specifier.imported.name;
          if (importedName in specialImports) {
            path.insertAfter(
              t.importDeclaration(
                [specifier],
                t.stringLiteral(specialImports[importedName])
              )
            );

            specifierIndexesToRemove.push(index);
          }
        });
        specifierIndexesToRemove.reverse().forEach((index) => {
          path.node.specifiers.splice(index, 1);
        });
        if (!path.node.specifiers.length) {
          path.remove();
        }
      },
    },
  };
}

function looksLike(a: any, b: any): boolean {
  return (
    a &&
    b &&
    Object.keys(b).every((bKey) => {
      const bVal = b[bKey];
      const aVal = a[bKey];
      if (typeof bVal === 'function') {
        return bVal(aVal);
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal);
    })
  );
}
function isPrimitive(val: any) {
  return val == null || /^[sbn]/.test(typeof val);
}

// eslint-disable-next-line import/no-default-export
export default RewriteImports;
