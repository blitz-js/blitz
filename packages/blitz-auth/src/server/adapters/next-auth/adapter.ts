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
import {toInternalRequest, toResponse} from "./internals/utils/web"
import {getBody, getURL, setHeaders} from "./internals/utils/node"
import type {RequestInternal, AuthOptions, User} from "next-auth"
import type {Cookie} from "next-auth/core/lib/cookie"
import type {AuthAction, InternalOptions} from "./internals/core/types"

import type {
  ApiHandlerIncomingMessage,
  BlitzNextAuthApiHandler,
  BlitzNextAuthOptions,
} from "./types"
import {Provider} from "next-auth/providers"

import {init} from "next-auth/core/init"
import getAuthorizationUrl from "next-auth/core/lib/oauth/authorization-url"
import oAuthCallback from "next-auth/core/lib/oauth/callback"

const INTERNAL_REDIRECT_URL_KEY = "_redirectUrl"

function switchURL(callbackUrl: string) {
  const url = new URL(callbackUrl)
  const pathName = url.pathname.split("/")
  const switchPathName = pathName.slice(0, pathName.length - 2)
  switchPathName.push(`${pathName[pathName.length - 1]}/${pathName[pathName.length - 2]}`)
  const switchPathNameString = switchPathName.join("/")
  return `${url.protocol}//${url.host}${switchPathNameString}${url.search}${url.hash}`
}

export function NextAuthAdapter<P extends Provider[]>(
  config: BlitzNextAuthOptions<P>,
): BlitzNextAuthApiHandler {
  return async function authHandler(req, res) {
    assert(
      req.query.nextauth,
      "req.query.nextauth is not defined. Page must be named [...auth].ts/js.",
    )
    assert(
      Array.isArray(req.query.nextauth),
      "req.query.nextauth must be an array. Page must be named [...auth].ts/js.",
    )
    if (!req.query.nextauth?.length) {
      return res.status(404).end()
    }
    const action = req.query.nextauth[1] as AuthAction
    if (!action || !["login", "callback"].includes(action)) {
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
    const request = new Request(switchURL(url.toString()), {
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
      // @ts-ignore
      url: new URL(
        // @ts-ignore
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

    options.provider.callbackUrl = switchURL(options.provider.callbackUrl)

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
        const authErrorQueryStringKey = config.errorRedirectUrl.includes("?")
          ? "&authError="
          : "?authError="
        const redirectUrl =
          authErrorQueryStringKey +
          encodeURIComponent(truncateString((error as Error).toString(), 100))
        res.status(302).setHeader("Location", config.errorRedirectUrl + redirectUrl)
        res.end()
        return null
      })
  }
}

async function AuthHandler<P extends Provider[]>(
  middleware: RequestMiddleware<ApiHandlerIncomingMessage, MiddlewareResponse<Ctx>>[],
  config: BlitzNextAuthOptions<P>,
  internalRequest: RequestInternal,
  action: AuthAction,
  options: InternalOptions,
  cookies: Cookie[],
) {
  if (!options.provider) {
    throw new OAuthError("MISSING_PROVIDER_ERROR")
  }
  if (action === "login") {
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
        const authErrorQueryStringKey = config.errorRedirectUrl.includes("?")
          ? "&authError="
          : "?authError="
        const redirectUrl =
          authErrorQueryStringKey + encodeURIComponent(truncateString((e as Error).toString(), 100))
        res.setHeader("Location", config.errorRedirectUrl + redirectUrl)
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
          const callback = await config.callback(profile as User, account, OAuthProfile!, session)
          let _redirect = config.successRedirectUrl
          if (callback instanceof Object) {
            _redirect = callback.redirectUrl
          }
          const response = toResponse({
            redirect: _redirect,
            cookies: cookies,
          })

          setHeaders(response.headers, res)
          res.setHeader("Location", _redirect)
          res.statusCode = 302
          res.end()
        } catch (e) {
          log.error("OAUTH_CALLBACK_Error in NextAuthAdapter " + (e as Error).toString())
          console.log(e)
          const authErrorQueryStringKey = config.errorRedirectUrl.includes("?")
            ? "&authError="
            : "?authError="
          const redirectUrl =
            authErrorQueryStringKey +
            encodeURIComponent(truncateString((e as Error).toString(), 100))
          res.setHeader("Location", config.errorRedirectUrl + redirectUrl)
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
