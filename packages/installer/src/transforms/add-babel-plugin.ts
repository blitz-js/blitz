import j from "jscodeshift"
import {Collection} from "jscodeshift/src/Collection"
import {findModuleExportsExpressions} from "./find-module-exports-expressions"

type AddBabelPluginDefinition = string | [string, Object]

export function addBabelPlugin(
  program: Collection<j.Program>,
  plugin: AddBabelPluginDefinition,
): Collection<j.Program> {
  findModuleExportsExpressions(program).forEach((moduleExportsExpression) => {
    j(moduleExportsExpression)
      .find(j.ObjectProperty, {key: {name: "plugins"}})
      .forEach((plugins) => {
        const pluginExpression = Array.isArray(plugin)
          ? j.arrayExpression([
              j.literal(plugin[0]),
              j.objectExpression(
                Object.entries(plugin[1]).map(([key, value]) =>
                  j.objectProperty(j.identifier(key), j.literal(value)),
                ),
              ),
            ])
          : j.literal(plugin)

        if (plugins.node.value.type === "ArrayExpression") {
          // TODO: detect if the plugin is already added
          plugins.node.value.elements.push(pluginExpression)
        }
      })
  })

  return program
}
