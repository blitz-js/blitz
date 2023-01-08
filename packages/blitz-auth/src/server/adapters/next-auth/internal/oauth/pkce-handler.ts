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

import * as jwt from "next-auth/jwt"
import {generators} from "openid-client"
import type {NextAuth_InternalOptions} from "../types"

const PKCE_CODE_CHALLENGE_METHOD = "S256"
const PKCE_MAX_AGE = 60 * 15 // 15 minutes in seconds

/**
 * Returns `code_challenge` and `code_challenge_method`
 * and saves them in a cookie.
 */
export async function createPKCE(options: NextAuth_InternalOptions<"oauth">): Promise<
  | undefined
  | {
      code_challenge: string
      code_challenge_method: "S256"
      cookie: any
    }
> {
  const {cookies, provider} = options
  if (!provider.checks?.includes("pkce")) {
    // Provider does not support PKCE, return nothing.
    return
  }
  const code_verifier = generators.codeVerifier()
  const code_challenge = generators.codeChallenge(code_verifier)

  const maxAge = cookies.pkceCodeVerifier.options.maxAge ?? PKCE_MAX_AGE

  const expires = new Date()
  expires.setTime(expires.getTime() + maxAge * 1000)

  // Encrypt code_verifier and save it to an encrypted cookie
  const encryptedCodeVerifier = await jwt.encode({
    ...options.jwt,
    maxAge,
    token: {code_verifier},
  })

  console.log("CREATE_PKCE_CHALLENGE_VERIFIER", {
    code_challenge,
    code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
    code_verifier,
    maxAge,
  })

  return {
    code_challenge,
    code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
    cookie: {
      name: cookies.pkceCodeVerifier.name,
      value: encryptedCodeVerifier,
      options: {...cookies.pkceCodeVerifier.options, expires},
    },
  }
}

/**
 * Returns code_verifier if provider uses PKCE,
 * and clears the container cookie afterwards.
 */
export async function usePKCECodeVerifier(
  codeVerifier: string | undefined,
  options: NextAuth_InternalOptions<"oauth">,
): Promise<{codeVerifier: string; cookie: any} | undefined> {
  const {cookies, provider} = options

  if (!provider?.checks?.includes("pkce") || !codeVerifier) {
    return
  }

  const pkce = (await jwt.decode({
    ...options.jwt,
    token: codeVerifier,
  })) as any

  return {
    codeVerifier: pkce?.code_verifier ?? undefined,
    cookie: {
      name: cookies.pkceCodeVerifier.name,
      value: "",
      options: {...cookies.pkceCodeVerifier.options, maxAge: 0},
    },
  }
}
