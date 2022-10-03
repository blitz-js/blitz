import type {ExpressionKind} from "ast-types/gen/kinds"
import j from "jscodeshift"
import {Program} from "../types"
import {addImport} from "./add-import"

export const addBlitzMiddleware = (program: Program, middleware: ExpressionKind): Program => {
  const pluginArray = program.find(j.Identifier, (node) => node.name === "plugins")

  pluginArray.get().parentPath.value.value.elements = [
    ...pluginArray.get().parentPath.value.value.elements,
    j.template.expression`BlitzServerMiddleware(${middleware})`,
  ]
  const blitzServerMiddleWare = j.importDeclaration(
    [j.importSpecifier(j.identifier("BlitzServerMiddleware"))],
    j.literal("blitz"),
  )
  addImport(program, blitzServerMiddleWare)

  return program
}
