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

// This is kept around for being backwards compatible with OAuth 1.0 providers.
// We have the intentions to provide only minor fixes for this in the future.

import {OAuth} from "oauth"
import type {NextAuth_InternalOptions} from "../types"

/**
 * Client supporting OAuth 1.x
 */
export function oAuth1Client(options: NextAuth_InternalOptions<"oauth">) {
  const provider = options.provider

  const oauth1Client = new OAuth(
    provider.requestTokenUrl as string,
    provider.accessTokenUrl as string,
    provider.clientId as string,
    provider.clientSecret as string,
    provider.version ?? "1.0",
    provider.callbackUrl,
    provider.encoding ?? "HMAC-SHA1",
  )

  // Promisify get()  for OAuth1
  const originalGet = oauth1Client.get.bind(oauth1Client)
  // @ts-expect-error
  oauth1Client.get = async (...args) => {
    return await new Promise((resolve, reject) => {
      // @ts-expect-error
      originalGet(...args, (error, result) => {
        if (error) {
          return reject(error)
        }
        resolve(result)
      })
    })
  }
  // Promisify getOAuth1AccessToken()  for OAuth1
  const originalGetOAuth1AccessToken = oauth1Client.getOAuthAccessToken.bind(oauth1Client)
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  oauth1Client.getOAuthAccessToken = async (...args: any[]) => {
    return await new Promise((resolve, reject) => {
      originalGetOAuth1AccessToken(
        // @ts-expect-error
        ...args,
        (error: any, oauth_token: any, oauth_token_secret: any) => {
          if (error) {
            return reject(error)
          }
          resolve({oauth_token, oauth_token_secret} as any)
        },
      )
    })
  }

  const originalGetOAuthRequestToken = oauth1Client.getOAuthRequestToken.bind(oauth1Client)
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  oauth1Client.getOAuthRequestToken = async (params = {}) => {
    return await new Promise((resolve, reject) => {
      originalGetOAuthRequestToken(params, (error, oauth_token, oauth_token_secret, params) => {
        if (error) {
          return reject(error)
        }
        resolve({oauth_token, oauth_token_secret, params} as any)
      })
    })
  }
  return oauth1Client
}
