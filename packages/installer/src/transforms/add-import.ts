import {ASTNode} from "ast-types"
import {NamedTypes} from "ast-types/gen/namedTypes"
import {builders} from "ast-types/gen/builders"
import {types} from "recast"

export function addImport(
  ast: ASTNode,
  __b: builders,
  t: NamedTypes,
  importToAdd: types.namedTypes.ImportDeclaration,
) {
  if (!t.File.check(ast) || !t.ImportDeclaration.check(importToAdd)) return
  const statements = ast.program.body
  if (statements.length > 0 && !t.ImportDeclaration.check(statements[0])) {
    ast.program.body.splice(0, 0, importToAdd)
  } else {
    const idx = ast.program.body.findIndex((node) => t.ImportDeclaration.check(node))
    ast.program.body.splice(idx + 1, 0, importToAdd)
  }
  return ast
}
