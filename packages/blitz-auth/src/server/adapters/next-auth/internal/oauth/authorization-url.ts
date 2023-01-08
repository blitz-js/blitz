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

import {openidClient} from "./client"
import {oAuth1Client} from "./client-legacy"
import {createState} from "./state-handler"
import {createNonce} from "./nonce-handler"
import {createPKCE} from "./pkce-handler"

import type {AuthorizationParameters} from "openid-client"
import type {RequestInternal} from "next-auth"
import type {NextAuth_InternalOptions} from "../types"

/**
 *
 * Generates an authorization/request token URL.
 *
 * [OAuth 2](https://www.oauth.com/oauth2-servers/authorization/the-authorization-request/) | [OAuth 1](https://oauth.net/core/1.0a/#auth_step2)
 */
export default async function getAuthorizationUrl({
  options,
  query,
}: {
  options: NextAuth_InternalOptions<"oauth">
  query: RequestInternal["query"]
}) {
  const {provider} = options
  let params: any = {}

  if (typeof provider.authorization === "string") {
    const parsedUrl = new URL(provider.authorization)
    const parsedParams = Object.fromEntries(parsedUrl.searchParams)
    params = {...params, ...parsedParams}
  } else {
    params = {...params, ...provider.authorization?.params}
  }

  params = {...params, ...query}

  // Handle OAuth v1.x
  if (provider.version?.startsWith("1.")) {
    const client = oAuth1Client(options)
    const tokens = (await client.getOAuthRequestToken(params)) as any
    const url = `${provider.authorization?.url}?${new URLSearchParams({
      oauth_token: tokens.oauth_token,
      oauth_token_secret: tokens.oauth_token_secret,
      ...tokens.params,
    })}`

    console.log("GET_AUTHORIZATION_URL", {url, provider})
    return {redirect: url}
  }

  const client = await openidClient(options)

  const authorizationParams: AuthorizationParameters = params
  const cookies = []

  const state = await createState(options)
  if (state) {
    authorizationParams.state = state.value
    cookies.push(state.cookie)
  }

  const nonce = await createNonce(options)
  if (nonce) {
    authorizationParams.nonce = nonce.value
    cookies.push(nonce.cookie)
  }

  const pkce = await createPKCE(options)
  if (pkce) {
    authorizationParams.code_challenge = pkce.code_challenge
    authorizationParams.code_challenge_method = pkce.code_challenge_method
    cookies.push(pkce.cookie)
  }

  const url = client.authorizationUrl(authorizationParams)

  console.log("GET_AUTHORIZATION_URL", {url, cookies, provider})
  return {redirect: url, cookies}
}
