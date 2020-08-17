import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"

export function addImport(
  program: Collection<j.Program>,
  importToAdd: j.ImportDeclaration,
): Collection<j.Program> {
  const importStatementCount = program.find(j.ImportDeclaration).length
  if (importStatementCount === 0) {
    program.find(j.Statement).at(0).insertBefore(importToAdd)
    return program
  }
  program.find(j.ImportDeclaration).forEach((stmt, idx) => {
    if (idx === importStatementCount - 1) {
      stmt.replace(stmt.node, importToAdd)
    }
  })
  return program
}
