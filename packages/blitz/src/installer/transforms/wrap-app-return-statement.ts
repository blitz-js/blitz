import {NodePath} from "ast-types/lib/node-path"
import j, {JSXAttribute} from "jscodeshift"
import {assert} from "../../index-server"
import {Program} from "../types"

export function wrapAppWithProvider(
  program: Program,
  element: string,
  attributes?: string[],
): Program {
  const findMyApp = program.find(j.FunctionDeclaration, (node) => node.id.name === "MyApp")
  assert(findMyApp.length, "MyApp function not found")

  findMyApp.forEach((path: NodePath) => {
    const statement = path.value.body.body.filter(
      (b: j.ReturnStatement) => b.type === "ReturnStatement",
    )[0]
    const argument = statement.argument

    let attrs: JSXAttribute[] = []
    if (attributes) {
      attrs = attributes.map((i) => j.jsxAttribute(j.jsxIdentifier(i)))
    }

    statement.argument = j.jsxElement(
      j.jsxOpeningElement(j.jsxIdentifier(element), attrs),
      j.jsxClosingElement(j.jsxIdentifier(element)),
      [j.jsxText("\n"), argument, j.jsxText("\n")],
    )
  })

  return program
}
