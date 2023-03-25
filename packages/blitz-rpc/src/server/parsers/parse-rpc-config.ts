import {parseSync} from "@swc/core"
import {ResolverConfig} from "blitz"

type _ResolverType = "GET" | "POST"

export function getResolverConfig(content: string): ResolverConfig {
  const resolverConfig: ResolverConfig = {
    httpMethod: "POST",
  }
  const resolver = parseSync(content, {
    syntax: "typescript",
    target: "es2020",
  })
  const exportDelaration = resolver.body.find((node) => {
    if (node.type === "ExportDeclaration") {
      if (node.declaration.type === "VariableDeclaration") {
        if (node.declaration.declarations[0]?.id.type === "Identifier") {
          if (node.declaration.declarations[0].id.value === "config") {
            return true
          }
        }
      }
    }
    return false
  })
  if (exportDelaration && exportDelaration.type == "ExportDeclaration") {
    const declaration = exportDelaration.declaration
    if (declaration && declaration.type == "VariableDeclaration") {
      const declarator = declaration.declarations[0]
      if (declarator && declarator.type == "VariableDeclarator") {
        const variable = declarator.init
        if (variable && variable.type == "ObjectExpression") {
          const properties = variable.properties
          if (properties) {
            const httpMethodProperty = properties.find((property) => {
              if (property.type == "KeyValueProperty") {
                if (property.key.type == "Identifier") {
                  return property.key.value == "httpMethod"
                }
              }
              return false
            })
            if (httpMethodProperty && httpMethodProperty.type == "KeyValueProperty") {
              const value = httpMethodProperty.value
              if (value && value.type == "StringLiteral") {
                resolverConfig.httpMethod = value.value as _ResolverType
              }
            }
          }
        }
      }
    }
  }
  return resolverConfig
}
