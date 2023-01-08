import {
  assert,
  connectMiddleware,
  Ctx,
  handleRequestWithMiddleware,
  MiddlewareResponse,
  RequestMiddleware,
  secureProxyMiddleware,
} from "blitz"
import oAuthCallback from "./internal/oauth/callback"
import getAuthorizationUrl from "./internal/oauth/authorization-url"
import {init} from "./internal/init"
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
    const {providerId} = internalRequest
    const {options, cookies} = await init({
      url: new URL(internalRequest.url!, "http://localhost:3000"),
      authOptions: config,
      action,
      providerId,
      callbackUrl: req.body?.callbackUrl ?? (req.query?.callbackUrl as string),
      cookies: internalRequest.cookies,
    })

    console.log("🚀 ~ file: [...auth].ts:122 ~ authHandler ~ options", options)
    console.log("🚀 ~ file: [...auth].ts:122 ~ authHandler ~ cookies", cookies)

    const oAuthHandler = await AuthHandler(
      req,
      middleware,
      config,
      internalRequest,
      action,
      options,
      cookies,
    )

    await handleRequestWithMiddleware<ApiHandlerIncomingMessage, MiddlewareResponse<Ctx>>(
      req,
      res as any,
      oAuthHandler?.middleware as any,
    )
  }
}

async function AuthHandler(
  req: ApiHandlerIncomingMessage,
  middleware: RequestMiddleware<ApiHandlerIncomingMessage, MiddlewareResponse<Ctx>>[],
  config: BlitzNextAuthOptions,
  internalRequest: any,
  action: NextAuth_AuthAction,
  options: NextAuth_InternalOptions,
  cookies: Cookie[],
) {
  if (action === "signin") {
    if (options.provider) {
      const _signin = await getAuthorizationUrl({options, query: req.query})
      if (_signin.cookies) cookies.push(..._signin.cookies)
      middleware.push(async (req, res, next) => {
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
      })
      return {middleware, redirect: _signin.redirect}
    }
  } else if (action === "callback") {
    if (options.provider) {
      middleware.push(
        // eslint-disable-next-line no-shadow
        connectMiddleware(async (req, res, next) => {
          const {
            profile,
            account,
            OAuthProfile,
            cookies: oauthCookies,
          } = await oAuthCallback({
            query: internalRequest.query,
            body: internalRequest.body,
            method: "POST",
            options,
            cookies: internalRequest.cookies,
          })
          const session = res.blitzCtx.session as SessionContext
          assert(session, "Missing Blitz sessionMiddleware!")
          console.log(
            "🚀 ~ file: [...auth].ts:122 ~ authHandler ~ callback",
            profile,
            account,
            OAuthProfile,
          )
          await config.callback(profile as User, account, OAuthProfile as Profile, session)
          const response = toResponse({
            redirect: config.successRedirectUrl,
            cookies: cookies,
          } as ResponseInternal)

          setHeaders(response.headers, res)
          res.setHeader("Location", config.successRedirectUrl)
          res.statusCode = 302
          res.end()
        }),
      )
      return {
        middleware,
        redirect: config.successRedirectUrl,
      }
    } else {
      // failure Case to be handled
      return {
        middleware,
        redirect: config.failureRedirectUrl,
      }
    }
  }
}
