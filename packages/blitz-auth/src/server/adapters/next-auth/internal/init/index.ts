/*
From https://github.com/nextauthjs/next-auth/tree/main/packages/next-auth/src/core/init.ts

ISC License

Copyright (c) 2022-2023, Balázs Orbán

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/
import {randomBytes, randomUUID} from "crypto"
import {AuthOptions, RequestInternal} from "next-auth"
import {parseProviders, parseUrl} from "./utils/parse"
import * as cookie from "./utils/cookie"
import * as jwt from "next-auth/jwt"
import {defaultCallbacks, createCallbackUrl} from "./utils"
import {createHash} from "crypto"
import type {NextAuth_InternalOptions} from "../types"

/**
 * Secret used salt cookies and tokens (e.g. for CSRF protection).
 * If no secret option is specified then it creates one on the fly
 * based on options passed here. If options contains unique data, such as
 * OAuth provider secrets and database credentials it should be sufficent. If no secret provided in production, we throw an error. */
export function createSecret(params: {authOptions: AuthOptions; url: URL}) {
  const {authOptions, url} = params

  return (
    authOptions.secret ??
    // TODO: Remove falling back to default secret, and error in dev if one isn't provided
    createHash("sha256")
      .update(JSON.stringify({...url, ...authOptions}))
      .digest("hex")
  )
}

interface InitParams {
  url: URL
  authOptions: AuthOptions
  providerId?: string
  action: NextAuth_InternalOptions["action"]
  /** Callback URL value extracted from the incoming request. */
  callbackUrl?: string
  cookies: RequestInternal["cookies"]
}

/** Initialize all internal options and cookies. */
export async function init({
  authOptions,
  providerId,
  action,
  url: reqUrl,
  cookies: reqCookies,
  callbackUrl: reqCallbackUrl,
}: InitParams): Promise<{
  options: NextAuth_InternalOptions
  cookies: cookie.Cookie[]
}> {
  if (providerId?.includes("?")) {
    providerId = providerId.split("?")[0]
  }
  // TODO: move this to web.ts
  const parsed = parseUrl(
    reqUrl.origin + reqUrl.pathname.replace(`/${action}`, "").replace(`/${providerId}`, ""),
  )
  const url = new URL(parsed.toString())
  console.log("🚀 ~ file: index.ts ~ line 85 ~ init ~ providerId", providerId)
  console.log("🚀 ~ file: index.ts ~ line 85 ~ init ~ url", url)

  const secret = createSecret({authOptions, url})

  const {providers, provider} = parseProviders({
    providers: authOptions.providers,
    url,
    providerId,
  })

  const maxAge = 30 * 24 * 60 * 60 // Sessions expire after 30 days of being idle by default

  // User provided options are overriden by other options,
  // except for the options with special handling above
  const options: NextAuth_InternalOptions = {
    debug: false,
    pages: {},
    theme: {
      colorScheme: "auto",
      logo: "",
      brandColor: "",
      buttonText: "",
    },
    // Custom options override defaults
    ...authOptions,
    // These computed settings can have values in userOptions but we override them
    // and are request-specific.
    url,
    action,
    // @ts-expect-errors
    provider,
    cookies: {
      ...cookie.defaultCookies(authOptions.useSecureCookies ?? url.protocol === "https:"),
      // Allow user cookie options to override any cookie settings above
      ...authOptions.cookies,
    },
    session: {
      // If no adapter specified, force use of JSON Web Tokens (stateless)
      //@ts-ignore
      strategy: authOptions.adapter ? "database" : "jwt",
      //@ts-ignore
      maxAge,
      //@ts-ignore
      updateAge: 24 * 60 * 60,
      generateSessionToken: () => {
        // Use `randomUUID` if available. (Node 15.6+)
        return randomUUID?.() ?? randomBytes(32).toString("hex")
      },
      ...authOptions.session,
    },
    secret,
    providers,
    // JWT options
    jwt: {
      secret, // Use application secret if no keys specified
      maxAge, // same as session maxAge,
      encode: jwt.encode,
      decode: jwt.decode,
      ...authOptions.jwt,
    },
    // Callback functions
    callbacks: {...defaultCallbacks, ...authOptions.callbacks},
    callbackUrl: url.origin,
  }

  // Init cookies

  const cookies: cookie.Cookie[] = []

  const {callbackUrl, callbackUrlCookie} = await createCallbackUrl({
    options,
    cookieValue: reqCookies?.[options.cookies.callbackUrl.name],
    paramValue: reqCallbackUrl,
  })
  options.callbackUrl = callbackUrl
  if (callbackUrlCookie) {
    cookies.push({
      name: options.cookies.callbackUrl.name,
      value: callbackUrlCookie,
      options: options.cookies.callbackUrl.options,
    })
  }

  return {options, cookies}
}
