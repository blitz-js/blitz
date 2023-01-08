import oAuthCallback from "./internal/oauth/callback"
import getAuthorizationUrl from "./internal/oauth/authorization-url"
import {init} from "./internal/init"
import {assert} from "blitz"
import {setHeaders, toInternalRequest, toResponse} from "./internal/utils"
import {NextAuth_AuthAction, NextAuth_InternalOptions} from "./internal/types"
import {Cookie} from "./internal/init/utils/cookie"
import type {ResponseInternal} from "next-auth/core"
import {ApiHandlerIncomingMessage, BlitzNextAuthApiHandler, BlitzNextAuthOptions} from "./types"

export function NextAuthAdapter(config: BlitzNextAuthOptions): BlitzNextAuthApiHandler {
  return async function authHandler(req, res) {
    assert(req.query.auth, "req.query.auth is not defined. Page must be named [...auth].ts/js.")
    assert(
      Array.isArray(req.query.auth),
      "req.query.auth must be an array. Page must be named [...blitz].ts/js.",
    )
    if (!req.query.auth?.length) {
      return res.status(404).end()
    }
    const action = req.query.auth[0] as NextAuth_AuthAction
    if (!action || !["signin", "callback"].includes(action)) {
      return res.status(404).end()
    }
    const internalRequest = await toInternalRequest(req)
    const {providerId, method} = internalRequest
    const {options, cookies} = await init({
      url: new URL(internalRequest.url!, "http://localhost:3000"),
      authOptions: config,
      action,
      providerId,
      callbackUrl: req.body?.callbackUrl ?? (req.query?.callbackUrl as string),
      csrfToken: req.body?.csrfToken,
      cookies: internalRequest.cookies,
      isPost: method === "POST",
    })

    console.log("🚀 ~ file: [...auth].ts:122 ~ authHandler ~ options", options)
    console.log("🚀 ~ file: [...auth].ts:122 ~ authHandler ~ cookies", cookies)

    const oAuthHandler = (await AuthHandler(
      req,
      internalRequest,
      action,
      options,
      cookies,
    )) as ResponseInternal

    const response = toResponse(oAuthHandler)

    // If the request expects a return URL, send it as JSON
    // instead of doing an actual redirect.
    const redirect = response.headers.get("Location")
    if (req.headers["X-Auth-Return-Redirect"] && redirect) {
      response.headers.delete("Location")
      response.headers.set("Content-Type", "application/json")
      return new Response(JSON.stringify({url: redirect}), {
        headers: response.headers,
      })
    }
    res.status(response.status)
    setHeaders(response.headers, res)

    console.log("🚀 ~ file: [...auth].ts:122 ~ authHandler ~ response", response.headers)

    return res.send(await response.text())
  }
}

async function AuthHandler(
  req: ApiHandlerIncomingMessage,
  internalRequest: any,
  action: NextAuth_AuthAction,
  options: NextAuth_InternalOptions,
  cookies: Cookie[],
) {
  if (action === "signin") {
    if (options.provider) {
      const _signin = await getAuthorizationUrl({options, query: req.query})
      if (_signin.cookies) cookies.push(..._signin.cookies)
      return _signin
    }
  } else if (action === "callback") {
    if (options.provider) {
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
      console.log(
        "🚀 ~ file: [...auth].ts:122 ~ authHandler ~ callback",
        profile,
        account,
        OAuthProfile,
      )
      if (oauthCookies) cookies.push(...oauthCookies)
      return {
        redirect: "/",
        cookies: oauthCookies,
      }
    }
  }
}
