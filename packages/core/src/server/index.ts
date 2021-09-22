/*
 * IF YOU CHANGE THIS FILE
 *    You also need to update the rewrite map in
 *    packages/babel-preset/src/rewrite-imports.ts
 */
export {resolver} from "./resolver"
export type {AuthenticatedMiddlewareCtx} from "./resolver"

export const fixNodeFileTrace = () => {
  const path = require("path")
  path.resolve(".blitz.config.compiled.js")
  path.resolve(".next/server/blitz-db.js")
  path.resolve(".next/serverless/blitz-db.js")
}
export const withFixNodeFileTrace = (fn: Function) => {
  fixNodeFileTrace()
  return fn
}
