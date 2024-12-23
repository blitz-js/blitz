import {
  ArcticFetchError,
  decodeIdToken,
  generateCodeVerifier,
  OAuth2Client,
  OAuth2RequestError,
  OAuth2Tokens,
} from "arctic"
import {generateState} from "arctic"
import cookie, {parse} from "cookie"
import {ArcticOAuthClient, SupportedOAuthProviders} from "./types"
import {getInternalConfig} from "./config"

type Params = Record<string, unknown>
type OAuthConfig = Array<{
  client: ArcticOAuthClient
  name: string
  scopes: string[]
}>

export function oAuth2Handler(config: OAuthConfig) {
  async function GET(req: Request, segmentData: {params: Promise<Params>}) {
    const params = await segmentData.params
    const blitzAuth = params.blitzAuth as string[]
    const clientName = blitzAuth[0]
    const clientConfig = config.find((c) => c.name === clientName)
    if (clientConfig === undefined || !clientName) {
      return new Response("Not Found", {status: 404})
    }
    const internalConfig = getInternalConfig(
      clientName as SupportedOAuthProviders,
      clientConfig.client,
    )
    const action = blitzAuth[1]
    if (action === "callback") {
      const cookies = parse(req.headers.get("Cookie") || "")
      const storedState = cookies.state
      const codeVerifier = cookies.code_verifier
      const url = new URL(req.url)
      const code = url.searchParams.get("code")
      const state = url.searchParams.get("state")
      if (
        code === null ||
        storedState === undefined ||
        codeVerifier === undefined ||
        typeof code !== "string" ||
        typeof state !== "string" ||
        state !== storedState
      ) {
        return new Response("Bad Request", {status: 400})
      }

      try {
        let token: OAuth2Tokens
        if (internalConfig.pkce) {
          token = await internalConfig.client.validateAuthorizationCode(code, codeVerifier)
        } else {
          token = await internalConfig.client.validateAuthorizationCode(code, clientConfig.scopes)
        }
        console.log(token)
        const idToken = token.idToken()
        console.log(idToken, decodeIdToken(idToken))
      } catch (e) {
        if (e instanceof OAuth2RequestError) {
          const code = e.code
          const message = e.message
          console.log(code, message)
          return new Response("Bad Request", {status: 400})
        }
        if (e instanceof ArcticFetchError) {
          const message = e.message
          console.log(message)
          return new Response("Bad Request", {status: 400})
        }
        console.log(e)
        return new Response("Bad Request", {status: 400})
      }
    } else {
      const state = generateState()
      const codeVerifier = generateCodeVerifier()
      let url: URL
      if (internalConfig.pkce) {
        url = internalConfig.client.createAuthorizationURL(state, codeVerifier, clientConfig.scopes)
      } else {
        url = internalConfig.client.createAuthorizationURL(state, clientConfig.scopes)
      }
      const stateCookie = cookie.serialize("state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10,
        path: "/",
      })
      const codeVerifierCookie = cookie.serialize("code_verifier", codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10,
        path: "/",
      })

      const headers = new Headers({
        Location: url.toString(),
      })

      headers.append("Set-Cookie", stateCookie)
      headers.append("Set-Cookie", codeVerifierCookie)

      return new Response(null, {
        status: 302,
        headers,
      })
    }
  }
  return {GET}
}
