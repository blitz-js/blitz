import {parseSync} from "@swc/core"
import {ResolverConfig} from "blitz"
import LRU from "lru-cache"
import {createHash} from "crypto"

const cache = new LRU<string, ResolverConfig>({max: 500, ttl: 1000 * 60 * 5})

export function getResolverConfig(content: string): ResolverConfig {
  const key = createHash("sha256").update(content).digest("hex")
  let p = cache.get(key)
  if (!p) {
    const resolverConfig = parseResolverCacheMiss(content)
    p = resolverConfig
    cache.set(key, resolverConfig)
  }
  return p
}

type _ResolverType = "GET" | "POST"

const defaultResolverConfig: ResolverConfig = {
  httpMethod: "POST",
}

function parseResolverCacheMiss(content: string): ResolverConfig {
  const resolverConfig = defaultResolverConfig
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
