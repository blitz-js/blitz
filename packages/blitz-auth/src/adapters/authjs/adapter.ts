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
import {isLocalhost} from "../../index-server"

// next-auth internals
import {getBody, getURL, setHeaders} from "./internals/core/node"
import type {AuthAction, InternalOptions, RequestInternal} from "./internals/core/types"
import type {Provider} from "@auth/core/providers"
import type {Cookie} from "@auth/core/lib/cookie"

import type {
  ApiHandlerIncomingMessage,
  BlitzNextAuthApiHandler,
  BlitzNextAuthOptions,
} from "./types"

import {init} from "@auth/core/lib/init"
import {getAuthorizationUrl} from "@auth/core/lib/oauth/authorization-url"
import {handleOAuth} from "@auth/core/lib/oauth/callback"
import {handleState} from "@auth/core/lib/oauth/handle-state"
import {toInternalRequest, toResponse} from "@auth/core/lib/web"
import {assertConfig} from "@auth/core/lib/assert"

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
      "req.query.nextauth is not defined. Page must be named [...nextauth].ts/js.",
    )
    assert(
      Array.isArray(req.query.nextauth),
      "req.query.nextauth must be an array. Page must be named [...nextauth].ts/js.",
    )
    if (!req.query.nextauth?.length) {
      return res.status(404).end()
    }
    const action = req.query.nextauth[1] as AuthAction
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
    console.log("NEXT_AUTH_URL", url)
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

    log.debug("NEXT_AUTH_REQUEST")

    const internalRequest = await toInternalRequest(request)

    log.debug("NEXT_AUTH_INTERNAL_REQUEST", internalRequest)

    if (internalRequest instanceof Error) {
      console.error((request as any).code, request)
      return new Response(`Error: This action with HTTP ${request.method} is not supported.`, {
        status: 400,
      })
    }

    const assertionResult = assertConfig(internalRequest, config)

    if (Array.isArray(assertionResult)) {
      assertionResult.forEach(log.error)
    } else if (assertionResult instanceof Error) {
      // Bail out early if there's an error in the user config
      log.error(assertionResult.message)
      return new Response(
        JSON.stringify({
          message:
            "There was a problem with the server configuration. Check the server logs for more information.",
          code: assertionResult.name,
        }),
        {status: 500, headers: {"Content-Type": "application/json"}},
      )
    }
    let {providerId} = internalRequest
    if (providerId.includes("?")) {
      providerId = providerId.split("?")[0]
    }
    const callbackUrl = req.body?.callbackUrl ?? req.query?.callbackUrl?.toString()
    const {options, cookies} = await init({
      url: new URL(
        internalRequest.url,
        process.env.APP_ORIGIN || process.env.BLITZ_DEV_SERVER_ORIGIN,
      ),
      authOptions: config,
      action,
      providerId,
      callbackUrl,
      cookies: internalRequest.cookies,
      isPost: req.method === "POST",
      csrfDisabled: config.csrf?.enabled ?? false,
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
  if (action === "signin") {
    middleware.push(async (req, res, _next) => {
      try {
        const _signin = await getAuthorizationUrl(req.query, options)
        log.debug("NEXT_AUTH_SIGNIN", _signin)
        if (_signin.cookies) cookies.push(..._signin.cookies)
        const session = res.blitzCtx.session
        assert(session, "Missing Blitz sessionMiddleware!")
        await session.$setPublicData({
          [INTERNAL_REDIRECT_URL_KEY]: _signin.redirect,
        } as any)
        const response = toResponse(_signin)
        setHeaders(response.headers, res)
        log.debug("NEXT_AUTH_SIGNIN_REDIRECT", _signin.redirect)
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
      connectMiddleware(async (req, res, _next) => {
        try {
          const {proxyRedirect, randomState} = handleState(
            req.query,
            options.provider,
            options.isOnRedirectProxy,
          )
          if (proxyRedirect) {
            log.debug("proxy redirect", {proxyRedirect, randomState})
            res.setHeader("Location", proxyRedirect)
            res.statusCode = 302
            res.end()
          }
          const {cookies, profile, account, user} = await handleOAuth(
            req.query,
            internalRequest.cookies,
            options,
          )
          console.log("NEXT_AUTH_CALLBACK", {cookies, profile, account, user})
          const session = res.blitzCtx.session
          assert(session, "Missing Blitz sessionMiddleware!")
          const callback = await config.callback(user, account, profile, session)
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
