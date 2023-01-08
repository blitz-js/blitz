/*
From https://github.com/nextauthjs/next-auth/tree/main/packages/next-auth/src/core/init.ts

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
import {OAuthConfig, Provider} from "next-auth/providers"
import {NextAuth_InternalProvider, NextAuth_OAuthConfigInternal} from "../../types"

// Source: https://stackoverflow.com/a/34749873/5364135

/** Simple object check */
function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item)
}

/** Deep merge two objects */
export function merge(target: any, ...sources: any[]): any {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, {[key]: {}})
        merge(target[key], source[key])
      } else {
        Object.assign(target, {[key]: source[key]})
      }
    }
  }

  return merge(target, ...sources)
}

/**
 * Transform OAuth options `authorization`, `token` and `profile` strings to `{ url: string; params: Record<string, string> }`
 */
function normalizeOAuthOptions(
  oauthOptions?: Partial<OAuthConfig<any>> | Record<string, unknown>,
  isUserOptions = false,
) {
  if (!oauthOptions) return

  const normalized = Object.entries(oauthOptions).reduce<
    NextAuth_OAuthConfigInternal<Record<string, unknown>>
  >(
    (acc, [key, value]) => {
      if (["authorization", "token", "userinfo"].includes(key) && typeof value === "string") {
        const url = new URL(value)
        //@ts-ignore
        acc[key] = {
          url: `${url.origin}${url.pathname}`,
          params: Object.fromEntries(url.searchParams ?? []),
        }
      } else {
        //@ts-ignore
        acc[key] = value
      }

      return acc
    },
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    {} as any,
  )

  if (!isUserOptions && !normalized.version?.startsWith("1.")) {
    // If provider has as an "openid-configuration" well-known endpoint
    // or an "openid" scope request, it will also likely be able to receive an `id_token`
    // Only do this if this function is not called with user options to avoid overriding in later stage.
    normalized.idToken = Boolean(
      normalized.idToken ??
        normalized.wellKnown?.includes("openid-configuration") ??
        normalized.authorization?.params?.scope?.includes("openid"),
    )

    if (!normalized.checks) normalized.checks = ["state"]
  }
  return normalized
}

export function parseProviders(params: {providers: Provider[]; url: URL; providerId?: string}): {
  providers: NextAuth_InternalProvider[]
  provider?: NextAuth_InternalProvider
} {
  const {url, providerId} = params

  const providers = params.providers.map<NextAuth_InternalProvider>(
    ({options: userOptions, ...rest}) => {
      if (rest.type === "oauth") {
        const normalizedOptions = normalizeOAuthOptions(rest)
        const normalizedUserOptions = normalizeOAuthOptions(userOptions, true)
        const id = normalizedUserOptions?.id ?? rest.id
        return merge(normalizedOptions, {
          ...normalizedUserOptions,
          signinUrl: `${url}/signin/${id}`,
          callbackUrl: `${url}/callback/${id}`,
        })
      }
      const id = (userOptions?.id as string) ?? rest.id
      return merge(rest, {
        ...userOptions,
        signinUrl: `${url}/signin/${id}`,
        callbackUrl: `${url}/callback/${id}`,
      })
    },
  )

  return {
    providers,
    provider: providers.find(({id}) => {
      if (!providerId) return false
      return id.includes(providerId) || providerId.includes(id)
    }),
  }
}

export interface InternalUrl {
  /** @default "http://localhost:3000" */
  origin: string
  /** @default "localhost:3000" */
  host: string
  /** @default "/api/auth" */
  path: string
  /** @default "http://localhost:3000/api/auth" */
  base: string
  /** @default "http://localhost:3000/api/auth" */
  toString: () => string
}

/**
 * TODO: Can we remove this?
 * Returns an `URL` like object to make requests/redirects from server-side
 */
export function parseUrl(url?: string | URL): InternalUrl {
  const defaultUrl = new URL("http://localhost:3000/api/auth")

  if (url && !url.toString().startsWith("http")) {
    url = `https://${url}`
  }

  const _url = new URL(url ?? defaultUrl)
  const path = (_url.pathname === "/" ? defaultUrl.pathname : _url.pathname)
    // Remove trailing slash
    .replace(/\/$/, "")

  const base = `${_url.origin}${path}`

  return {
    origin: _url.origin,
    host: _url.host,
    path,
    base,
    toString: () => base,
  }
}
