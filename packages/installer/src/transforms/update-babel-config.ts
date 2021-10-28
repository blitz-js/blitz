import j from "jscodeshift"
import {findModuleExportsExpressions} from "./find-module-exports-expressions"

type AddBabelItemDefinition = string | [name: string, options: Record<string, any>]

function updateBabelConfig(
  program: j.Collection<j.Program>,
  item: AddBabelItemDefinition,
  key: string,
) {
  findModuleExportsExpressions(program).forEach((moduleExportsExpression) => {
    j(moduleExportsExpression)
      .find(j.ObjectProperty, {key: {name: key}})
      .forEach((items) => {
        // Don't add it again if it already exists,
        // that what this code does. For simplicity,
        // all the examples will be with key = 'presets'

        const itemExpression = Array.isArray(item)
          ? j.arrayExpression([
              j.literal(item[0]),
              j.objectExpression(
                Object.entries(item[1]).map(([key, value]) =>
                  j.objectProperty(j.identifier(key), j.literal(value)),
                ),
              ),
            ])
          : j.literal(item)

        const itemName = Array.isArray(item) ? item[0] : item

        if (items.node.value.type === "Literal" || items.node.value.type === "StringLiteral") {
          // {
          //   presets: "this-preset"
          // }
          if (itemName !== items.node.value.value) {
            items.node.value = j.arrayExpression([items.node.value, itemExpression])
          }
        } else if (items.node.value.type === "ArrayExpression") {
          // {
          //   presets: ["this-preset", "maybe-another", ...]
          // }
          // Here, it will return if it find the preset inside the
          // array, so the last line doesn't push a duplicated preset
          for (const [i, element] of items.node.value.elements.entries()) {
            if (!element) continue

            if (element.type === "Literal" || element.type === "StringLiteral") {
              // {
              //   presets: [..., "this-preset", ...]
              // }
              if (element.value === itemName) return
            } else if (element.type === "ArrayExpression") {
              // {
              //   presets: [..., ["this-preset"], ...]
              // }
              if (
                (element.elements[0]?.type === "Literal" ||
                  element.elements[0]?.type === "StringLiteral") &&
                element.elements[0].value === itemName
              ) {
                if (
                  element.elements[1]?.type !== "ObjectExpression" ||
                  element.elements[1].properties.length === 0
                ) {
                  // The preset has no config.
                  // Its ["this-preset"] instead of ["this-preset", {config: ...}]
                  items.node.value.elements[i] = itemExpression
                }

                return
              }
            }
          }
          items.node.value.elements.push(itemExpression)
        }
      })
  })

  return program
}

export const addBabelPreset = (program: j.Collection<j.Program>, preset: AddBabelItemDefinition) =>
  updateBabelConfig(program, preset, "presets")
export const addBabelPlugin = (program: j.Collection<j.Program>, plugin: AddBabelItemDefinition) =>
  updateBabelConfig(program, plugin, "plugins")
