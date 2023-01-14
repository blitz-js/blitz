import cookieSession from "cookie-session"
import {
  assert,
  connectMiddleware,
  Ctx,
  handleRequestWithMiddleware,
  log,
  MiddlewareResponse,
  OAuthError,
  RequestMiddleware,
  secureProxyMiddleware,
  truncateString,
} from "blitz"
import {isLocalhost, SessionContext} from "../../../index-server"

// next-auth internals
import oAuthCallback from "./next-auth/packages/next-auth/src/core/lib/oauth/callback"
import getAuthorizationUrl from "./next-auth/packages/next-auth/src/core/lib/oauth/authorization-url"
import {init} from "./next-auth/packages/next-auth/src/core/init"
import {toInternalRequest, toResponse} from "./next-auth/packages/next-auth/src/utils/web"
import {getBody, getURL, setHeaders} from "./next-auth/packages/next-auth/src/utils/node"
import type {RequestInternal} from "./next-auth/packages/next-auth/src/core"
import type {Cookie} from "./next-auth/packages/core/src/lib/cookie"
import type {
  AuthAction,
  AuthOptions,
  InternalOptions,
} from "./next-auth/packages/next-auth/src/core/types"

import type {
  ApiHandlerIncomingMessage,
  BlitzNextAuthApiHandler,
  BlitzNextAuthOptions,
} from "./types"
import type {User} from "next-auth"

const INTERNAL_REDIRECT_URL_KEY = "_redirectUrl"

export function NextAuthAdapter(config: BlitzNextAuthOptions): BlitzNextAuthApiHandler {
  return async function authHandler(req, res) {
    assert(req.query.auth, "req.query.auth is not defined. Page must be named [...auth].ts/js.")
    assert(
      Array.isArray(req.query.auth),
      "req.query.auth must be an array. Page must be named [...auth].ts/js.",
    )
    if (!req.query.auth?.length) {
      return res.status(404).end()
    }
    const action = req.query.auth[0] as AuthAction
    if (!action || !["signin", "callback"].includes(action)) {
      return res.status(404).end()
    }

    const cookieSessionMiddleware = cookieSession({
      secret: process.env.SESSION_SECRET_KEY || "default-dev-secret",
      secure: process.env.NODE_ENV === "production" && !isLocalhost(req),
    })

    const middleware: RequestMiddleware<ApiHandlerIncomingMessage, MiddlewareResponse<Ctx>>[] = [
      connectMiddleware(cookieSessionMiddleware as RequestMiddleware),
    ]

    if (config.secureProxy) {
      middleware.push(secureProxyMiddleware)
    }

    const headers = new Headers(req.headers as any)
    const url = getURL(req.url, headers)
    if (url instanceof Error) {
      if (process.env.NODE_ENV !== "production") throw url
      const errorLogger = config.logger?.error ?? console.error
      errorLogger("INVALID_URL", url)
      res.status(400)
      return res.json({
        message:
          "There is a problem with the server configuration. Check the server logs for more information.",
      })
    }
    const request = new Request(url, {
      headers,
      method: req.method,
      ...getBody(req),
    })

    const internalRequest = await toInternalRequest(request)
    if (internalRequest instanceof Error) {
      console.error((request as any).code, request)
      return new Response(`Error: This action with HTTP ${request.method} is not supported.`, {
        status: 400,
      })
    }
    let {providerId} = internalRequest
    if (providerId?.includes("?")) {
      providerId = providerId.split("?")[0]
    }
    const {options, cookies} = await init({
      url: new URL(
        internalRequest.url!,
        process.env.APP_ORIGIN || process.env.BLITZ_DEV_SERVER_ORIGIN,
      ),
      authOptions: config as unknown as AuthOptions,
      action,
      providerId,
      callbackUrl: req.body?.callbackUrl ?? (req.query?.callbackUrl as string),
      cookies: internalRequest.cookies,
      isPost: req.method === "POST",
    })

    log.debug("NEXT_AUTH_INTERNAL_OPTIONS", options)

    await AuthHandler(middleware, config, internalRequest, action, options, cookies)
      .then(async ({middleware}) => {
        await handleRequestWithMiddleware<ApiHandlerIncomingMessage, MiddlewareResponse<Ctx>>(
          req,
          res,
          middleware,
        )
      })
      .catch((error) => {
        const authErrorQueryStringKey = config.failureRedirectUrl.includes("?")
          ? "&authError="
          : "?authError="
        const redirectUrl =
          authErrorQueryStringKey +
          encodeURIComponent(truncateString((error as Error).toString(), 100))
        res.status(302).setHeader("Location", config.failureRedirectUrl + redirectUrl)
        res.end()
        return null
      })
  }
}

async function AuthHandler(
  middleware: RequestMiddleware<ApiHandlerIncomingMessage, MiddlewareResponse<Ctx>>[],
  config: BlitzNextAuthOptions,
  internalRequest: RequestInternal,
  action: AuthAction,
  options: InternalOptions,
  cookies: Cookie[],
) {
  console.log("options", options)
  if (!options.provider) {
    throw new OAuthError("MISSING_PROVIDER_ERROR")
  }
  if (action === "signin") {
    middleware.push(async (req, res, next) => {
      try {
        const _signin = await getAuthorizationUrl({options: options, query: req.query})
        if (_signin.cookies) cookies.push(..._signin.cookies)
        const session = res.blitzCtx.session as SessionContext
        assert(session, "Missing Blitz sessionMiddleware!")
        await session.$setPublicData({
          [INTERNAL_REDIRECT_URL_KEY]: _signin.redirect,
        } as any)
        const response = toResponse(_signin)
        setHeaders(response.headers, res)
        res.setHeader("Location", _signin.redirect)
        res.statusCode = 302
        res.end()
      } catch (e) {
        log.error("OAUTH_SIGNIN_Error in NextAuthAdapter " + (e as Error).toString())
        console.log(e)
        const authErrorQueryStringKey = config.failureRedirectUrl.includes("?")
          ? "&authError="
          : "?authError="
        const redirectUrl =
          authErrorQueryStringKey + encodeURIComponent(truncateString((e as Error).toString(), 100))
        res.setHeader("Location", config.failureRedirectUrl + redirectUrl)
        res.statusCode = 302
        res.end()
      }
    })
    return {middleware}
  } else if (action === "callback") {
    middleware.push(
      // eslint-disable-next-line no-shadow
      connectMiddleware(async (req, res, next) => {
        try {
          const {profile, account, OAuthProfile} = await oAuthCallback({
            query: internalRequest.query,
            body: internalRequest.body || {code: req.query.code, state: req.query.state},
            method: "POST",
            options: options as any,
            cookies: internalRequest.cookies,
          })
          const session = res.blitzCtx.session as SessionContext
          assert(session, "Missing Blitz sessionMiddleware!")
          await config.callback(profile as User, account, OAuthProfile!, session)
          const response = toResponse({
            redirect: config.successRedirectUrl,
            cookies: cookies,
          })

          setHeaders(response.headers, res)
          res.setHeader("Location", config.successRedirectUrl)
          res.statusCode = 302
          res.end()
        } catch (e) {
          log.error("OAUTH_CALLBACK_Error in NextAuthAdapter " + (e as Error).toString())
          console.log(e)
          const authErrorQueryStringKey = config.failureRedirectUrl.includes("?")
            ? "&authError="
            : "?authError="
          const redirectUrl =
            authErrorQueryStringKey +
            encodeURIComponent(truncateString((e as Error).toString(), 100))
          res.setHeader("Location", config.failureRedirectUrl + redirectUrl)
          res.statusCode = 302
          res.end()
        }
      }),
    )
    return {
      middleware,
    }
  } else {
    throw new OAuthError("Invalid action")
  }
}
