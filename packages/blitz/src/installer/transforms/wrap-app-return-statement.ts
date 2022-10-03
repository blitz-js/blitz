import {NodePath} from "ast-types/lib/node-path"
import j from "jscodeshift"
import {assert} from "../../index-server"
import {Program} from "../types"

export function wrapAppWithProvider(program: Program, element: string): Program {
  const findMyApp = program.find(j.FunctionDeclaration, (node) => node.id.name === "MyApp")
  assert(findMyApp.length, "MyApp function not found")

  findMyApp.forEach((path: NodePath) => {
    const statement = path.value.body.body.filter(
      (b: j.ReturnStatement) => b.type === "ReturnStatement",
    )[0]
    const argument = statement.argument

    statement.argument = j.jsxElement(
      j.jsxOpeningElement(j.jsxIdentifier(element)),
      j.jsxClosingElement(j.jsxIdentifier(element)),
      [j.jsxText("\n"), argument, j.jsxText("\n")],
    )
  })

  return program
}
