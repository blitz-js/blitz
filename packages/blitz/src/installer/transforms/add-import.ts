import j from "jscodeshift"
import {Program} from "../types"

export function addImport(program: Program, importToAdd: j.ImportDeclaration): Program {
  const importStatementCount = program.find(j.ImportDeclaration).length
  if (importStatementCount === 0) {
    program.find(j.Statement).at(0).insertBefore(importToAdd)
    return program
  }
  program.find<j.ImportDeclaration>(j.ImportDeclaration).forEach((stmt, idx) => {
    const node = stmt.node
    if (idx === importStatementCount - 1) {
      stmt.replace(node, importToAdd)
    }
  })
  return program
}
