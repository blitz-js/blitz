import type {ExpressionKind} from "ast-types/gen/kinds"
import j from "jscodeshift"
import {Program} from "../types"

export const addBlitzMiddleware = (program: Program, middleware: ExpressionKind): Program => {
  const pluginArray = program.find(j.Identifier, (node) => node.name === "plugins")

  pluginArray.get().parentPath.value.value.elements = [
    ...pluginArray.get().parentPath.value.value.elements,
    j.template.expression`BlitzServerMiddleware(${middleware})`,
  ]

  return program
}
