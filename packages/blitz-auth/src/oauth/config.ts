import {decodeIdToken, GitHub, Google, OAuth2Tokens} from "arctic"
import {ArcticOAuthClient, SupportedOAuthProviders} from "./types"

type InternalConfig = {
  name: SupportedOAuthProviders
  profile(token: OAuth2Tokens): Record<string, unknown>
  pkce: true
  client: 
}

export function getInternalConfig(provider: SupportedOAuthProviders, client: ArcticOAuthClient) {
  switch (provider) {
    case SupportedOAuthProviders.Google:
      return {
        name: SupportedOAuthProviders.Google,
        profile(token: OAuth2Tokens) {
          const idToken = token.idToken()

          return decodeIdToken(idToken)
        },
        pkce: true,
        client: client,
      }
    case SupportedOAuthProviders.GitHub:
      return {
        name: SupportedOAuthProviders.GitHub,
        profile(token: OAuth2Tokens) {
          const idToken = token.idToken()
          return decodeIdToken(idToken)
        },
        pkce: false,
        client: client,
      }
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
