import type {ExpressionKind} from "ast-types/gen/kinds"
import j from "jscodeshift"
import {Program} from "../types"

function recursiveConfigSearch(
  program: Program,
  obj: ExpressionKind,
): j.ObjectExpression | undefined {
  // Identifier being a variable name
  if (obj.type === "Identifier") {
    const {node} = j(obj).get()

    // Get the definition of the variable
    const identifier: j.ASTPath<j.VariableDeclarator> = program
      .find(j.VariableDeclarator, {
        id: {name: node.name},
      })
      .get()

    // Return what is after the `=`
    return identifier.value.init ? recursiveConfigSearch(program, identifier.value.init) : undefined
  } else if (obj.type === "CallExpression") {
    // If it's an function call (like `withBundleAnalyzer`), get the first argument
    if (obj.arguments.length === 0) {
      // If it has no arguments, create an empty object: `{}`
      let config = j.objectExpression([])
      obj.arguments.push(config)
      return config
    } else {
      const arg = obj.arguments[0]
      if (arg) {
        if (arg.type === "SpreadElement") return undefined
        else return recursiveConfigSearch(program, arg)
      }
    }
  } else if (obj.type === "ObjectExpression") {
    // If it's an object, return it
    return obj
  } else {
    return undefined
  }
}

export type TransformBlitzConfigCallback = (config: j.ObjectExpression) => j.ObjectExpression

export function transformBlitzConfig(
  program: Program,
  transform: TransformBlitzConfigCallback,
): Program {
  let moduleExportsExpressions = program.find(j.AssignmentExpression, {
    operator: "=",
    left: {object: {name: "module"}, property: {name: "exports"}},
    right: {},
  })

  // If there isn't any `module.exports = ...`, create one
  if (moduleExportsExpressions.length === 0) {
    let config = j.objectExpression([])

    config = transform(config)

    let moduleExportExpression = j.expressionStatement(
      j.assignmentExpression(
        "=",
        j.memberExpression(j.identifier("module"), j.identifier("exports")),
        config,
      ),
    )

    program.get().node.program.body.push(moduleExportExpression)
  } else if (moduleExportsExpressions.length === 1) {
    let moduleExportsExpression: j.ASTPath<j.AssignmentExpression> = moduleExportsExpressions.get()

    let config: j.ObjectExpression | undefined = recursiveConfigSearch(
      program,
      moduleExportsExpression.value.right,
    )

    if (config) {
      config = transform(config)
    } else {
      console.warn(
        "The configuration couldn't be found, but there is a 'module.exports' inside `blitz.config.js`",
      )
    }
  } else {
    console.warn("There are multiple 'module.exports' inside 'blitz.config.js'")
  }

  return program
}
