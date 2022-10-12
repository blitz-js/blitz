import {Module, parseSync} from "@swc/core"
import {ResolverConfig} from "blitz"
import fs from "fs"
import LRU from "lru-cache"
import {createHash} from "crypto"

const cache = new LRU<string, Module>({max: 500, ttl: 1000 * 60 * 5})

function parseResolverWithCache(content: string, fileName: string): Module {
  const key = createHash("sha256").update(content).digest("hex")
  let p = cache.get(key)
  if (!p) {
    // console.log("Cache Miss! Parsing:", fileName)
    const resolver = parseSync(content, {
      syntax: "typescript",
      target: "es2020",
    })
    p = resolver
    cache.set(key, resolver)
    // } else{
    // console.log("Cache Hit!!")
    //print all the keys
    //   }
  }
  return p
}

type _ResolverType = "GET" | "POST"

const defaultResolverConfig: ResolverConfig = {
  httpMethod: "POST",
}

export function getResolverConfig(pathPath: string): ResolverConfig {
  // console.time("getResolverConfig " + pathPath)
  const resolverConfig = defaultResolverConfig
  const resolver = parseResolverWithCache(fs.readFileSync(pathPath, {encoding: "utf-8"}), pathPath)
  const exportDelaration = resolver.body.find((node) => node.type === "ExportDeclaration")
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
  // console.timeEnd("getResolverConfig " + pathPath)
  return resolverConfig
}
