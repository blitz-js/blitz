import { PluginObj } from '@babel/core';
import { BabelType } from 'babel-plugin-tester';

const defaultImport = '@blitzjs/core';

const specialImports: Record<string, string> = {
  Image: '@blitzjs/core/image',
  // 'Head': '@blitzjs/core/head'
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

        path.node.source = t.stringLiteral(defaultImport);

        path.node.specifiers.forEach((specifier, index) => {
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
            if (path.node.specifiers.length > 1) {
              path.node.specifiers.splice(index, 1);
            } else {
              path.remove();
            }
          }
        });
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
