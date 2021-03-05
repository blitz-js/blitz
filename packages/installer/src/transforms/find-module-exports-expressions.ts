import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"

export function findModuleExportsExpressions(program: Collection<j.Program>) {
  return program
    .find(j.AssignmentExpression)
    .filter(
      (path) =>
        path.value.left.type === "MemberExpression" &&
        (path.value.left.object as any).name === "module" &&
        (path.value.left.property as any).name === "exports" &&
        path.value.right.type === "ObjectExpression",
    )
}
