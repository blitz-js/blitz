import type {BlitzServerPlugin, Ctx, RequestMiddleware} from "blitz"
import {assert} from "blitz"
import {IncomingMessage, ServerResponse} from "http"
import {SessionConfigMethods} from "../shared"
import {getSession} from "./auth-sessions"

interface SessionConfigOptions {
  cookiePrefix?: string
  sessionExpiryMinutes?: number
  method?: "essential" | "advanced"
  sameSite?: "none" | "lax" | "strict"
  secureCookies?: boolean
  domain?: string
  publicDataKeysToSyncAcrossSessions?: string[]
}

interface IsAuthorized {
  isAuthorized: (data: {ctx: Ctx; args: any}) => boolean
}

const defaultConfig_: SessionConfigOptions = {
  sessionExpiryMinutes: 30 * 24 * 60, // Sessions expire after 30 days of being idle
  method: "essential",
  sameSite: "lax",
  publicDataKeysToSyncAcrossSessions: ["role", "roles"],
  secureCookies: !process.env.DISABLE_SECURE_COOKIES && process.env.NODE_ENV === "production",
}

interface AuthPluginOptions extends Partial<SessionConfigOptions>, IsAuthorized {
  storage: SessionConfigMethods
}

export function AuthServerPlugin(options: AuthPluginOptions): BlitzServerPlugin<any, any> {
  // pass types
  globalThis.__BLITZ_SESSION_COOKIE_PREFIX = options.cookiePrefix || "blitz"

  function authPluginSessionMiddleware() {
    assert(
      options.isAuthorized,
      "You must provide an authorization implementation to sessionMiddleware as isAuthorized(userRoles, input)",
    )

    global.sessionConfig = {
      ...defaultConfig_,
      ...options.storage,
      ...options,
    }

    const cookiePrefix = global.sessionConfig.cookiePrefix ?? "blitz"
    assert(
      cookiePrefix.match(/^[a-zA-Z0-9-_]+$/),
      `The cookie prefix used has invalid characters. Only alphanumeric characters, "-"  and "_" character are supported`,
    )

    const blitzSessionMiddleware: RequestMiddleware<
      IncomingMessage,
      ServerResponse & {blitzCtx: Ctx}
    > = async (req, res, next) => {
      console.log("Starting sessionMiddleware...")
      if (!res.blitzCtx?.session) {
        await getSession(req, res)
      }
      return next()
    }

    blitzSessionMiddleware.config = {
      name: "blitzSessionMiddleware",
      cookiePrefix,
    }
    return blitzSessionMiddleware
  }

  return {
    requestMiddlewares: [authPluginSessionMiddleware()],
  }
}
