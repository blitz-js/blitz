import j from "jscodeshift"
import {assert} from "../../index-server"
import {Program} from "../types"

export function transformNextConfig(program: Program): {
  program: Program
  configObj: []
  pushToConfig: (property: j.ObjectProperty) => void
  wrapConfig: (func: string | j.CallExpression) => {
    withBlitz: j.Identifier | j.CallExpression
  }
  addRequireStatement: (identifier: string, packageName: string) => void
} {
  const configObj = program
    .find<j.VariableDeclarator>(j.VariableDeclarator, (filter) => filter.id.name === "config")
    .get().parentPath.value[0].init.properties

  assert(configObj, "Config object not found")

  const pushToConfig = (property: j.ObjectProperty) => {
    configObj.push(property)
  }

  const wrapConfig = (
    func: string | j.CallExpression,
  ): {
    withBlitz: j.Identifier | j.CallExpression
  } => {
    const withBlitz = program
      .find(j.CallExpression, (filter) => filter.callee.name === "withBlitz")
      .get().value.arguments

    assert(withBlitz, "withBlitz wrapper not found")

    if (typeof func === "string") {
      withBlitz.push(j.template.expression`${func}(${withBlitz})`)
      withBlitz.splice(0, 1)
    } else {
      withBlitz.push(func)
      withBlitz.splice(0, 1)
    }

    return {
      withBlitz,
    }
  }

  const addRequireStatement = (identifier: string, packageName: string) => {
    program
      .get()
      .value.program.body.unshift(
        j.expressionStatement(
          j.assignmentExpression(
            "=",
            j.identifier(identifier),
            j.callExpression(j.identifier("require"), [j.identifier(`"${packageName}"`)]),
          ),
        ),
      )
  }

  return {
    program,
    configObj,
    pushToConfig,
    wrapConfig,
    addRequireStatement,
  }
}
