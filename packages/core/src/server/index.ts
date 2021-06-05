/*
 * IF YOU CHANGE THIS FILE
 *    You also need to update the rewrite map in
 *    packages/babel-preset/src/rewrite-imports.ts
 */
export {
  getAllMiddlewareForModule,
  handleRequestWithMiddleware,
  connectMiddleware,
} from "./middleware"

export {invokeWithMiddleware} from "./invoke-with-middleware"

export {paginate, isLocalhost} from "./server-utils"
export type {PaginateArgs} from "./server-utils"

export {resolver} from "./resolver"
export type {AuthenticatedMiddlewareCtx} from "./resolver"

export {
  sessionMiddleware,
  simpleRolesIsAuthorized,
  getSession,
  setPublicDataForUser,
} from "./auth/sessions"
export type {SimpleRolesIsAuthorized} from "./auth/sessions"
export {passportAuth} from "./auth/passport-adapter"
export {SecurePassword, hash256, generateToken} from "./auth/auth-utils"

export {rpcApiHandler} from "./rpc-server"

export const fixNodeFileTrace = () => {
  const path = require("path")
  path.resolve("next.config.js")
  path.resolve(".blitz/blitz.config.js")
  path.resolve(".next/server/blitz-db.js")
}
export const withFixNodeFileTrace = (fn: Function) => {
  fixNodeFileTrace()
  return fn
}
