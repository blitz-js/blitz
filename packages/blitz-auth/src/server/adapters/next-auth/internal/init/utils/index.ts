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
import {createHash, randomBytes} from "crypto"
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

interface CreateCSRFTokenParams {
  options: NextAuth_InternalOptions
  cookieValue?: string
  isPost: boolean
  bodyValue?: string
}

/**
 * Ensure CSRF Token cookie is set for any subsequent requests.
 * Used as part of the strategy for mitigation for CSRF tokens.
 *
 * Creates a cookie like 'next-auth.csrf-token' with the value 'token|hash',
 * where 'token' is the CSRF token and 'hash' is a hash made of the token and
 * the secret, and the two values are joined by a pipe '|'. By storing the
 * value and the hash of the value (with the secret used as a salt) we can
 * verify the cookie was set by the server and not by a malicous attacker.
 *
 * For more details, see the following OWASP links:
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie
 * https://owasp.org/www-chapter-london/assets/slides/David_Johansson-Double_Defeat_of_Double-Submit_Cookie.pdf
 */
export function createCSRFToken({options, cookieValue, isPost, bodyValue}: CreateCSRFTokenParams) {
  if (cookieValue) {
    const [csrfToken, csrfTokenHash] = cookieValue.split("|")
    const expectedCsrfTokenHash = createHash("sha256")
      .update(`${csrfToken}${options.secret}`)
      .digest("hex")
    if (csrfTokenHash === expectedCsrfTokenHash) {
      // If hash matches then we trust the CSRF token value
      // If this is a POST request and the CSRF Token in the POST request matches
      // the cookie we have already verified is the one we have set, then the token is verified!
      const csrfTokenVerified = isPost && csrfToken === bodyValue

      return {csrfTokenVerified, csrfToken}
    }
  }

  // New CSRF token
  const csrfToken = randomBytes(32).toString("hex")
  const csrfTokenHash = createHash("sha256").update(`${csrfToken}${options.secret}`).digest("hex")
  const cookie = `${csrfToken}|${csrfTokenHash}`

  return {cookie, csrfToken}
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
