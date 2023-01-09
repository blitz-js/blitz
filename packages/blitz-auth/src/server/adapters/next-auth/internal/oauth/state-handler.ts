/*
From https://github.com/nextauthjs/next-auth/tree/main/packages/next-auth/src/core/lib/oauth

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

import {generators} from "openid-client"
import type {NextAuth_InternalOptions} from "../types"

const STATE_MAX_AGE = 60 * 15 // 15 minutes in seconds

/** Returns state if the provider supports it */
export async function createState(
  options: NextAuth_InternalOptions<"oauth">,
): Promise<{cookie: any; value: string} | undefined> {
  const {provider, jwt, cookies} = options

  if (!provider.checks?.includes("state")) {
    // Provider does not support state, return nothing
    return
  }

  const state = generators.state()
  const maxAge = cookies.state.options.maxAge ?? STATE_MAX_AGE

  const encodedState = await jwt.encode({
    ...jwt,
    maxAge,
    token: {state},
  })

  const expires = new Date()
  expires.setTime(expires.getTime() + maxAge * 1000)
  return {
    value: state,
    cookie: {
      name: cookies.state.name,
      value: encodedState,
      options: {...cookies.state.options, expires},
    },
  }
}

/**
 * Returns state from if the provider supports states,
 * and clears the container cookie afterwards.
 */
export async function useState(
  state: string | undefined,
  options: NextAuth_InternalOptions<"oauth">,
): Promise<{value: string; cookie: any} | undefined> {
  const {cookies, provider, jwt} = options

  if (!provider.checks?.includes("state") || !state) return

  const value = (await jwt.decode({...options.jwt, token: state})) as any

  return {
    value: value?.state ?? undefined,
    cookie: {
      name: cookies.state.name,
      value: "",
      options: {...cookies.pkceCodeVerifier.options, maxAge: 0},
    },
  }
}
