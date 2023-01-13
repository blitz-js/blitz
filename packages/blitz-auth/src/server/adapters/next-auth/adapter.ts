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
import oAuthCallback from "./next-auth/packages/next-auth/src/core/lib/oauth/callback"
import getAuthorizationUrl from "./next-auth/packages/next-auth/src/core/lib/oauth/authorization-url"
import {init} from "./next-auth/packages/next-auth/src/core/init"
import {setHeaders, toInternalRequest, toResponse} from "./internal/utils"
import {Cookie} from "./internal/init/utils/cookie"
import type {NextAuth_AuthAction, NextAuth_InternalOptions} from "./internal/types"
import type {
  ApiHandlerIncomingMessage,
  BlitzNextAuthApiHandler,
  BlitzNextAuthOptions,
} from "./types"
import type {ResponseInternal} from "next-auth/core"
import cookieSession from "cookie-session"
import {isLocalhost, SessionContext} from "../../../index-server"
import {Profile, User} from "next-auth"

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
    const action = req.query.auth[0] as NextAuth_AuthAction
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

    const internalRequest = await toInternalRequest(req)
    let {providerId} = internalRequest
    // remove stuff after ? from providerId
    if (providerId?.includes("?")) {
      providerId = providerId.split("?")[0]
    }
    const {options, cookies} = await init({
      url: new URL(
        internalRequest.url!,
        process.env.APP_ORIGIN || process.env.BLITZ_DEV_SERVER_ORIGIN,
      ),
      authOptions: config as any,
      action,
      providerId,
      callbackUrl: req.body?.callbackUrl ?? (req.query?.callbackUrl as string),
      cookies: internalRequest.cookies,
      isPost: req.method === "POST",
    })

    log.debug("NEXT_AUTH_INTERNAL_OPTIONS", options)

    await AuthHandler(middleware, config, internalRequest, action, options as any, cookies)
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
  internalRequest: Awaited<ReturnType<typeof toInternalRequest>>,
  action: NextAuth_AuthAction,
  options: NextAuth_InternalOptions,
  cookies: Cookie[],
) {
  console.log("options", options)
  if (!options.provider) {
    throw new OAuthError("MISSING_PROVIDER_ERROR")
  }
  if (action === "signin") {
    middleware.push(async (req, res, next) => {
      try {
        const _signin = await getAuthorizationUrl({options: options as any, query: req.query})
        if (_signin.cookies) cookies.push(..._signin.cookies)
        const session = res.blitzCtx.session as SessionContext
        assert(session, "Missing Blitz sessionMiddleware!")
        await session.$setPublicData({
          [INTERNAL_REDIRECT_URL_KEY]: _signin.redirect,
        } as any)
        const response = toResponse(_signin as ResponseInternal)
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
          await config.callback(profile as User, account, OAuthProfile as Profile, session)
          const response = toResponse({
            redirect: config.successRedirectUrl,
            cookies: cookies,
          } as ResponseInternal)

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
