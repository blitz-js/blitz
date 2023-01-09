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

import {log} from "blitz"
import * as jwt from "next-auth/jwt"
import {generators} from "openid-client"
import type {NextAuth_InternalOptions} from "../types"

const NONCE_MAX_AGE = 60 * 15 // 15 minutes in seconds

/**
 * Returns nonce if the provider supports it
 * and saves it in a cookie */
export async function createNonce(options: NextAuth_InternalOptions<"oauth">): Promise<
  | undefined
  | {
      value: string
      cookie: any
    }
> {
  const {cookies, provider} = options
  if (!provider.checks?.includes("nonce")) {
    // Provider does not support nonce, return nothing.
    return
  }

  const nonce = generators.nonce()

  const expires = new Date()
  expires.setTime(expires.getTime() + NONCE_MAX_AGE * 1000)

  // Encrypt nonce and save it to an encrypted cookie
  const encryptedNonce = await jwt.encode({
    ...options.jwt,
    maxAge: NONCE_MAX_AGE,
    token: {nonce},
  })

  log.debug("CREATE_ENCRYPTED_NONCE", {
    nonce,
    maxAge: NONCE_MAX_AGE,
  })

  return {
    cookie: {
      name: cookies.nonce.name,
      value: encryptedNonce,
      options: {...cookies.nonce.options, expires},
    },
    value: nonce,
  }
}

/**
 * Returns nonce from if the provider supports nonce,
 * and clears the container cookie afterwards.
 */
export async function useNonce(
  nonce: string | undefined,
  options: NextAuth_InternalOptions<"oauth">,
): Promise<{value: string; cookie: any} | undefined> {
  const {cookies, provider} = options

  if (!provider?.checks?.includes("nonce") || !nonce) {
    return
  }

  const value = (await jwt.decode({...options.jwt, token: nonce})) as any

  return {
    value: value?.nonce ?? undefined,
    cookie: {
      name: cookies.nonce.name,
      value: "",
      options: {...cookies.nonce.options, maxAge: 0},
    },
  }
}
