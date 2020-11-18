import {fromPairs} from "lodash"
import {useRouter} from "next/router"
import {useMemo} from "react"
import {ParsedUrlQueryValue} from "./types"
import {useRouterQuery} from "./use-router-query"

export interface ParsedUrlQuery {
  [key: string]: ParsedUrlQueryValue
}

function areQueryValuesEqual(value1: ParsedUrlQueryValue, value2: ParsedUrlQueryValue) {
  // Check if their type match
  if (typeof value1 !== typeof value2) {
    return false
  }

  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) {
      return false
    }

    for (let i = 0; i < value1.length; i++) {
      if (value1[i] !== value2[i]) {
        return false
      }
    }

    return true
  }

  return value1 === value2
}

export function extractRouterParams(routerQuery: ParsedUrlQuery, query: ParsedUrlQuery) {
  return fromPairs(
    Object.entries(routerQuery).filter(
      ([key, value]) =>
        typeof query[key] === "undefined" || !areQueryValuesEqual(value, query[key]),
    ),
  )
}

export type Dict<T> = Record<string, T | undefined>
type ReturnTypes = "string" | "number" | "array"

export function useParams(returnType?: unknown): Dict<undefined | string | string[]>
export function useParams(returnType: "string"): Dict<string>
export function useParams(returnType: "number"): Dict<number>
export function useParams(returnType: "array"): Dict<string[]>
export function useParams(returnType?: ReturnTypes | unknown) {
  const router = useRouter()
  const query = useRouterQuery()

  const params = useMemo(() => {
    const rawParams = extractRouterParams(router.query, query)

    if (returnType === "string") {
      const params: Dict<string> = {}
      for (const key in rawParams) {
        if (typeof rawParams[key] === "string") {
          params[key] = rawParams[key] as string
        }
      }
      return params
    }

    if (returnType === "number") {
      const params: Dict<number> = {}
      for (const key in rawParams) {
        if (rawParams[key]) {
          const num = Number(rawParams[key])
          params[key] = isNaN(num) ? undefined : num
        }
      }
      return params
    }

    if (returnType === "array") {
      const params: Dict<string[]> = {}
      for (const key in rawParams) {
        const rawValue = rawParams[key]
        if (Array.isArray(rawParams[key])) {
          params[key] = rawValue as string[]
        } else if (typeof rawValue === "string") {
          params[key] = [rawValue]
        }
      }
      return params
    }

    return rawParams
  }, [router.query, query, returnType])

  return params
}

export function useParam(key: string): undefined | string | string[]
export function useParam(key: string, returnType: "string"): string | undefined
export function useParam(key: string, returnType: "number"): number | undefined
export function useParam(key: string, returnType: "array"): string[] | undefined
export function useParam(
  key: string,
  returnType?: ReturnTypes,
): undefined | number | string | string[] {
  const params = useParams(returnType)
  const rawValue = params[key]

  return rawValue
}
