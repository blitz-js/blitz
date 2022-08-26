import j from "jscodeshift"
import {Program} from "../types"
import {namedTypes} from "ast-types"
import assert from "assert"

export const findModuleExportsExpressions = (program: Program) =>
  program.find(j.AssignmentExpression).filter((path) => {
    assert.ok(namedTypes.AssignmentExpression.check(path.value))
    const {left, right} = path.value

    return (
      left.type === "MemberExpression" &&
      left.object.type === "Identifier" &&
      left.property.type === "Identifier" &&
      left.property.name === "exports" &&
      right.type === "ObjectExpression"
    )
  })
