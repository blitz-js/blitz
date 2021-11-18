import j from "jscodeshift"
import {Program} from "../types"

export function wrapBlitzConfig(program: Program, functionName: string): Program {
  let moduleExportsExpressions = program.find(j.AssignmentExpression, {
    operator: "=",
    left: {object: {name: "module"}, property: {name: "exports"}},
    right: {},
  })

  // If there isn't any `module.exports = ...`, create one
  if (moduleExportsExpressions.length === 0) {
    let moduleExportExpression = j.expressionStatement(
      j.assignmentExpression(
        "=",
        j.memberExpression(j.identifier("module"), j.identifier("exports")),
        j.callExpression(j.identifier(functionName), [j.objectExpression([])]),
      ),
    )

    program.get().node.program.body.push(moduleExportExpression)
  } else if (moduleExportsExpressions.length === 1) {
    let moduleExportsExpression: j.ASTPath<j.AssignmentExpression> = moduleExportsExpressions.get()

    moduleExportsExpression.value.right = j.callExpression(j.identifier(functionName), [
      moduleExportsExpression.value.right,
    ])
  } else {
    console.warn("There are multiple 'module.exports' inside 'blitz.config.js'")
  }

  return program
}
