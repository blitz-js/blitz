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
import {CallbacksOptions} from "next-auth"
import type {NextAuth_InternalOptions} from "../../types"

export const defaultCallbacks: CallbacksOptions = {
  signIn() {
    return true
  },
  redirect({url, baseUrl}) {
    if (url.startsWith("/")) return `${baseUrl}${url}`
    else if (new URL(url).origin === baseUrl) return url
    return baseUrl
  },
  session({session}) {
    return session
  },
  jwt({token}) {
    return token
  },
}

interface CreateCallbackUrlParams {
  options: NextAuth_InternalOptions
  /** Try reading value from request body (POST) then from query param (GET) */
  paramValue?: string
  cookieValue?: string
}

/**
 * Get callback URL based on query param / cookie + validation,
 * and add it to `req.options.callbackUrl`.
 */
export async function createCallbackUrl({
  options,
  paramValue,
  cookieValue,
}: CreateCallbackUrlParams) {
  const {url, callbacks} = options

  let callbackUrl = url.origin

  if (paramValue) {
    // If callbackUrl form field or query parameter is passed try to use it if allowed
    callbackUrl = await callbacks.redirect({
      url: paramValue,
      baseUrl: url.origin,
    })
  } else if (cookieValue) {
    // If no callbackUrl specified, try using the value from the cookie if allowed
    callbackUrl = await callbacks.redirect({
      url: cookieValue,
      baseUrl: url.origin,
    })
  }

  return {
    callbackUrl,
    // Save callback URL in a cookie so that it can be used for subsequent requests in signin/signout/callback flow
    callbackUrlCookie: callbackUrl !== cookieValue ? callbackUrl : undefined,
  }
}
