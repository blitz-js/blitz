import type {ExpressionKind} from "ast-types/gen/kinds"
import {namedTypes} from "ast-types"
import j, {ASTPath} from "jscodeshift"
import {JsonObject, JsonValue} from "../types"
import {Program} from "../types"
import {findModuleExportsExpressions} from "./find-module-exports-expressions"

type AddBabelItemDefinition = string | [name: string, options: JsonObject]

const jsonValueToExpression = (value: JsonValue): ExpressionKind =>
  typeof value === "string"
    ? j.stringLiteral(value)
    : typeof value === "number"
    ? j.numericLiteral(value)
    : typeof value === "boolean"
    ? j.booleanLiteral(value)
    : value === null
    ? j.nullLiteral()
    : Array.isArray(value)
    ? j.arrayExpression(value.map(jsonValueToExpression))
    : j.objectExpression(
        Object.entries(value)
          .filter((entry): entry is [string, JsonValue] => entry[1] !== undefined)
          .map(([key, value]) =>
            j.objectProperty(j.stringLiteral(key), jsonValueToExpression(value)),
          ),
      )

function updateBabelConfig(program: Program, item: AddBabelItemDefinition, key: string): Program {
  findModuleExportsExpressions(program).forEach((moduleExportsExpression) => {
    const foundExpression: Program = j(moduleExportsExpression)
    foundExpression
      .find<j.ObjectProperty>(j.ObjectProperty, {key: {name: key}})
      .forEach((items) => {
        // Don't add it again if it already exists,
        // that what this code does. For simplicity,
        // all the examples will be with key = 'presets'

        const itemName = Array.isArray(item) ? item[0] : item

        if (items.node.value.type === "Literal" || items.node.value.type === "StringLiteral") {
          // {
          //   presets: "this-preset"
          // }
          if (itemName !== items.node.value.value) {
            items.node.value = j.arrayExpression([items.node.value, jsonValueToExpression(item)])
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
                  element.elements[1]?.type === "ObjectExpression" &&
                  element.elements[1].properties.length > 0
                ) {
                  // The preset has a config.
                  // ["this-preset", {...}]
                  if (Array.isArray(item)) {
                    // If it has an adittional config, add the new keys
                    // (don't matter if they already exists, let the user handle it later by themself)
                    let obj = element.elements[1]

                    for (const key in item[1]) {
                      const value = item[1][key]
                      if (value === undefined) continue
                      obj.properties.push(
                        j.objectProperty(j.stringLiteral(key), jsonValueToExpression(value)),
                      )
                    }

                    items.node.value.elements[i] = obj
                  }
                } else {
                  // The preset has no config.
                  // Its ["this-preset"]
                  items.node.value.elements[i] = jsonValueToExpression(item)
                }

                return
              }
            }
          }
          items.node.value.elements.push(jsonValueToExpression(item))
        }
      })
  })

  return program
}

export const addBabelPreset = (program: Program, preset: AddBabelItemDefinition): Program =>
  updateBabelConfig(program, preset, "presets")
export const addBabelPlugin = (program: Program, plugin: AddBabelItemDefinition): Program =>
  updateBabelConfig(program, plugin, "plugins")
