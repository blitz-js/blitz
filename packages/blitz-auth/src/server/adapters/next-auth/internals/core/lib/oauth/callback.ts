import {TokenSet} from "openid-client"
import {openidClient} from "./client"
import {oAuth1Client} from "./client-legacy"
import {useState} from "./state-handler"
import {usePKCECodeVerifier} from "./pkce-handler"
import {useNonce} from "./nonce-handler"
import {log, OAuthError} from "blitz"

import type {CallbackParamsType, OpenIDCallbackChecks} from "openid-client"
import type {Profile, RequestInternal} from "next-auth"
import type {OAuthChecks, OAuthConfig} from "next-auth/providers"
import type {InternalOptions} from "../../types"

export default async function oAuthCallback(params: {
  options: InternalOptions<"oauth">
  query: RequestInternal["query"]
  body: RequestInternal["body"]
  method: Required<RequestInternal>["method"]
  cookies: RequestInternal["cookies"]
}) {
  const {options, query, body, method, cookies} = params
  const {provider} = options

  const errorMessage = body?.error ?? query?.error
  if (errorMessage) {
    const error = new Error(errorMessage)
    console.error("OAUTH_CALLBACK_HANDLER_ERROR", {
      error,
      error_description: query?.error_description,
      providerId: provider.id,
    })
    log.debug("OAUTH_CALLBACK_HANDLER_ERROR", {body})
    throw error
  }

  if (provider.version?.startsWith("1.")) {
    try {
      const client = await oAuth1Client(options)
      // Handle OAuth v1.x
      const {oauth_token, oauth_verifier} = query ?? {}
      const tokens = (await (client as any).getOAuthAccessToken(
        oauth_token,
        null,
        oauth_verifier,
      )) as TokenSet
      let profile: Profile = await (client as any).get(
        provider.profileUrl,
        tokens.oauth_token,
        tokens.oauth_token_secret,
      )

      if (typeof profile === "string") {
        profile = JSON.parse(profile)
      }

      const newProfile = await getProfile({profile, tokens, provider})
      return {...newProfile, cookies: []}
    } catch (error) {
      console.error("OAUTH_V1_GET_ACCESS_TOKEN_ERROR", error as Error)
      throw error
    }
  }

  try {
    const client = await openidClient(options)

    let tokens: TokenSet

    const checks: OAuthChecks = {}
    const resCookies = []
    //eslint-disable-next-line
    const state = await useState(cookies?.[options.cookies.state.name], options)
    if (state) {
      checks.state = state.value
      resCookies.push(state.cookie)
    }
    //eslint-disable-next-line
    const nonce = await useNonce(cookies?.[options.cookies.nonce.name], options)
    if (nonce && provider.idToken) {
      ;(checks as OpenIDCallbackChecks).nonce = nonce.value
      resCookies.push(nonce.cookie)
    }

    const codeVerifier = cookies?.[options.cookies.pkceCodeVerifier.name]
    //eslint-disable-next-line
    const pkce = await usePKCECodeVerifier(codeVerifier, options)
    if (pkce) {
      checks.code_verifier = pkce.codeVerifier
      resCookies.push(pkce.cookie)
    }
    const params: CallbackParamsType = {
      ...client.callbackParams(`http://n?${new URLSearchParams(query)}`),
      ...provider.token?.params,
    }

    if (provider.token?.request) {
      const response = await provider.token.request({
        provider,
        params,
        checks,
        client,
      })
      tokens = new TokenSet(response.tokens)
    } else if (provider.idToken) {
      tokens = await client.callback(provider.callbackUrl, params, checks)
    } else {
      tokens = await client.oauthCallback(provider.callbackUrl, params, checks)
    }

    log.debug("PROVIDER", provider)
    log.debug("OAUTH_CALLBACK_TOKENS", tokens)

    // REVIEW: How can scope be returned as an array?
    if (Array.isArray(tokens.scope)) {
      tokens.scope = tokens.scope.join(" ")
    }

    let profile: Profile
    if (provider.userinfo?.request) {
      profile = await provider.userinfo.request({
        provider,
        tokens,
        client,
      })
    } else if (provider.idToken) {
      profile = tokens.claims()
    } else {
      profile = await client.userinfo(tokens, {
        params: provider.userinfo?.params,
      })
    }

    const profileResult = await getProfile({
      profile,
      provider,
      tokens,
    })
    return {...profileResult, cookies: resCookies}
  } catch (error) {
    throw new OAuthError((error as Error).message)
  }
}

export interface GetProfileParams {
  profile: Profile
  tokens: TokenSet
  provider: OAuthConfig<any>
}

/** Returns profile, raw profile and auth provider details */
async function getProfile({profile: OAuthProfile, tokens, provider}: GetProfileParams) {
  try {
    log.debug("PROFILE_DATA", {OAuthProfile})
    const profile = await provider.profile(OAuthProfile, tokens)
    profile.email = profile.email?.toLowerCase()
    if (!profile.id)
      throw new TypeError(`Profile id is missing in ${provider.name} OAuth profile response`)

    // Return profile, raw profile and auth provider details
    return {
      profile,
      account: {
        provider: provider.id,
        type: provider.type,
        providerAccountId: profile.id.toString(),
        ...tokens,
      },
      OAuthProfile,
    }
  } catch (error) {
    // If we didn't get a response either there was a problem with the provider
    // response *or* the user cancelled the action with the provider.
    //
    // Unfortuately, we can't tell which - at least not in a way that works for
    // all providers, so we return an empty object; the user should then be
    // redirected back to the sign up page. We log the error to help developers
    // who might be trying to debug this when configuring a new provider.
    console.error("OAUTH_PARSE_PROFILE_ERROR", {
      error: error as Error,
      OAuthProfile,
    })
  }
}
