import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"

export function findModuleExportsExpressions(program: Collection<j.Program>) {
  return program.find(j.AssignmentExpression).filter((path) => {
    const {left, right} = path.value
    return (
      left.type === "MemberExpression" &&
      left.object.type === "Identifier" &&
      left.property.type === "Identifier" &&
      left.property.name === "exports" &&
      right.type === "ObjectExpression"
    )
  })
}
