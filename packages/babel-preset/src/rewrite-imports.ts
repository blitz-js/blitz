import { PluginObj } from '@babel/core';
import { BabelType } from 'babel-plugin-tester';

/*
 * https://astexplorer.net/#/gist/dd0cdbd56a701d8c9e078d20505b3980/latest
 */

const defaultImportSource = '@blitzjs/core';

const specialImports: Record<string, string> = {
  Link: 'next/link',
  Image: 'next/image',
  Script: 'next/script',

  Document: 'next/document',
  DocumentHead: 'next/document',
  Html: 'next/document',
  Main: 'next/document',
  BlitzScript: 'next/document',

  AuthenticationError: 'next/stdlib',
  AuthorizationError: 'next/stdlib',
  CSRFTokenMismatchError: 'next/stdlib',
  NotFoundError: 'next/stdlib',
  PaginationArgumentError: 'next/stdlib',
  RedirectError: 'next/stdlib',

  paginate: 'next/stdlib-server',
  isLocalhost: 'next/stdlib-server',
  invokeWithMiddleware: 'next/stdlib-server',
  passportAuth: 'next/stdlib-server',
  sessionMiddleware: 'next/stdlib-server',
  simpleRolesIsAuthorized: 'next/stdlib-server',
  getSession: 'next/stdlib-server',
  setPublicDataForUser: 'next/stdlib-server',
  SecurePassword: 'next/stdlib-server',
  hash256: 'next/stdlib-server',
  generateToken: 'next/stdlib-server',
  logger: 'next/stdlib-server',

  BlitzProvider: 'next/data-client',
  getAntiCSRFToken: 'next/data-client',
  useSession: 'next/data-client',
  useAuthenticatedSession: 'next/data-client',
  useAuthorize: 'next/data-client',
  useQuery: 'next/data-client',
  usePaginatedQuery: 'next/data-client',
  useInfiniteQuery: 'next/data-client',
  useMutation: 'next/data-client',
  queryClient: 'next/data-client',
  getQueryKey: 'next/data-client',
  invalidateQuery: 'next/data-client',
  setQueryData: 'next/data-client',
  useQueryErrorResetBoundary: 'next/data-client',
  QueryClient: 'next/data-client',
  dehydrate: 'next/data-client',
  invoke: 'next/data-client',

  Head: '@blitzjs/core/head',

  App: '@blitzjs/core/app',

  dynamic: '@blitzjs/core/dynamic',
  noSSR: '@blitzjs/core/dynamic',

  getConfig: '@blitzjs/core/config',
  setConfig: '@blitzjs/core/config',

  resolver: '@blitzjs/core/server',
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
