/*

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
import {OAuthError} from "blitz"
import {parse as parseCookie, serialize} from "cookie"
import {ServerResponse} from "http"
import type {ResponseInternal} from "next-auth/core"
import {ApiHandlerIncomingMessage} from "../../types"

const actions = ["signin", "callback"]

async function getBody(req: Request): Promise<Record<string, any> | undefined> {
  if (!("body" in req) || !req.body || req.method !== "POST") return

  const contentType = req.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    return await req.json()
  } else if (contentType?.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(await req.text())
    return Object.fromEntries(params)
  }
}

export async function toInternalRequest(req: ApiHandlerIncomingMessage) {
  const {url: pathname} = req

  const action = actions.find((a) => pathname?.includes(a)) as "signin" | "callback" | undefined
  if (!action) {
    throw new OAuthError("Cannot detect action.")
  }

  if (req.method !== "GET" && req.method !== "POST") {
    throw new OAuthError("Only GET and POST requests are supported.")
  }

  const providerIdOrAction = pathname?.split("/").pop()
  let providerId
  if (
    providerIdOrAction &&
    !action.includes(providerIdOrAction) &&
    ["signin", "callback"].includes(action)
  ) {
    providerId = providerIdOrAction
  }

  const cookies = parseCookie(req.headers.cookie ?? "") ?? {}

  return {
    url: pathname,
    action,
    providerId,
    method: req.method,
    headers: req.headers,
    body: req.body ? await getBody(req as unknown as Request) : undefined,
    cookies,
    query: req.query,
  }
}

export function toResponse(res: ResponseInternal): Response {
  const headers = new Headers(res.headers as any)

  res.cookies?.forEach((cookie) => {
    const {name, value, options} = cookie
    const cookieHeader = serialize(name, value, options)
    if (headers.has("Set-Cookie")) {
      headers.append("Set-Cookie", cookieHeader)
    } else {
      headers.set("Set-Cookie", cookieHeader)
    }
  })

  const body =
    headers.get("content-type") === "application/json" ? JSON.stringify(res.body) : res.body

  const response = new Response(body, {
    headers,
    status: res.redirect ? 302 : res.status ?? 200,
  })

  if (res.redirect) {
    response.headers.set("Location", res.redirect.toString())
  }

  return response
}

function getSetCookies(cookiesString: string) {
  if (typeof cookiesString !== "string") {
    return []
  }

  const cookiesStrings: string[] = []
  let pos = 0
  let start
  let ch
  let lastComma: number
  let nextStart
  let cookiesSeparatorFound

  function skipWhitespace() {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1
    }
    return pos < cookiesString.length
  }

  function notSpecialChar() {
    ch = cookiesString.charAt(pos)

    return ch !== "=" && ch !== ";" && ch !== ","
  }

  while (pos < cookiesString.length) {
    start = pos
    cookiesSeparatorFound = false

    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos)
      if (ch === ",") {
        // ',' is a cookie separator if we have later first '=', not ';' or ','
        lastComma = pos
        pos += 1

        skipWhitespace()
        nextStart = pos

        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1
        }

        // currently special character
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          // we found cookies separator
          cookiesSeparatorFound = true
          // pos is inside the next cookie, so back up and return it.
          pos = nextStart
          cookiesStrings.push(cookiesString.substring(start, lastComma))
          start = pos
        } else {
          // in param ',' or param separator ';',
          // we continue from that comma
          pos = lastComma + 1
        }
      } else {
        pos += 1
      }
    }

    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.substring(start, cookiesString.length))
    }
  }

  return cookiesStrings
}

export function setHeaders(headers: Headers, res: ServerResponse) {
  for (const [key, val] of headers.entries()) {
    let value: string | string[] = val
    // See: https://github.com/whatwg/fetch/issues/973
    if (key === "set-cookie") {
      const cookies = getSetCookies(value)
      let original = res.getHeader("set-cookie") as string[] | string
      original = Array.isArray(original) ? original : [original]
      value = original.concat(cookies).filter(Boolean)
    }
    res.setHeader(key, value)
  }
}
