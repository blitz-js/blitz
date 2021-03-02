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

export {sessionMiddleware, simpleRolesIsAuthorized, getSessionContext} from "./auth/sessions"
export type {SimpleRolesIsAuthorized} from "./auth/sessions"
export {passportAuth} from "./auth/passport-adapter"
export {SecurePassword, hash256, generateToken} from "./auth/auth-utils"
