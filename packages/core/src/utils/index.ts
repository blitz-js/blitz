import {QueryKeyPart} from "react-query"

export const isServer = typeof window === "undefined"

export function getQueryKey(cacheKey: string, params: any): readonly [string, ...QueryKeyPart[]] {
  return [cacheKey, typeof params === "function" ? (params as Function)() : params]
}
