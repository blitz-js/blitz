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

import {Issuer, custom} from "openid-client"
import type {Client} from "openid-client"
import type {NextAuth_InternalOptions} from "../types"

/**
 * NOTE: We can add auto discovery of the provider's endpoint
 * that requires only one endpoint to be specified by the user.
 * Check out `Issuer.discover`
 *
 * Client supporting OAuth 2.x and OIDC
 */
export async function openidClient(options: NextAuth_InternalOptions<"oauth">): Promise<Client> {
  const provider = options.provider

  if (provider.httpOptions) custom.setHttpOptionsDefaults(provider.httpOptions)

  let issuer: Issuer
  if (provider.wellKnown) {
    issuer = await Issuer.discover(provider.wellKnown)
  } else {
    issuer = new Issuer({
      issuer: provider.issuer as string,
      authorization_endpoint: provider.authorization?.url,
      token_endpoint: provider.token?.url,
      userinfo_endpoint: provider.userinfo?.url,
    })
  }

  const client = new issuer.Client(
    {
      client_id: provider.clientId as string,
      client_secret: provider.clientSecret as string,
      redirect_uris: [provider.callbackUrl],
      ...provider.client,
    },
    provider.jwks,
  )

  // allow a 10 second skew
  // See https://github.com/nextauthjs/next-auth/issues/3032
  // and https://github.com/nextauthjs/next-auth/issues/3067
  client[custom.clock_tolerance] = 10

  return client
}
