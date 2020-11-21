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

export function useParams(): Record<string, undefined | string | string[]>
export function useParams(returnType: "string"): Record<string, string | undefined>
export function useParams(returnType: "number"): Record<string, number>
export function useParams(returnType: "array"): Record<string, Array<string | undefined>>
export function useParams(returnType?: "string" | "number" | "array") {
  const router = useRouter()
  const query = useRouterQuery()

  const params = useMemo(() => {
    const rawParams = extractRouterParams(router.query, query)

    if (returnType === "string") {
      const params: Record<string, string> = {}
      for (const key in rawParams) {
        if (typeof rawParams[key] === "string") {
          params[key] = rawParams[key] as string
        }
      }
      return params
    }

    if (returnType === "number") {
      const params: Record<string, number> = {}
      for (const key in rawParams) {
        if (rawParams[key]) {
          params[key] = Number(rawParams[key])
        }
      }
      return params
    }

    if (returnType === "array") {
      const params: Record<string, Array<string | undefined>> = {}
      for (const key in rawParams) {
        if (Array.isArray(rawParams[key])) {
          params[key] = rawParams[key] as Array<string | undefined>
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
export function useParam(key: string, returnType: "array"): Array<string | undefined>
export function useParam(
  key: string,
  returnType?: "string" | "number" | "array",
): undefined | number | string | Array<string | undefined> {
  const params = useParams()
  const rawValue = params[key]

  if (typeof rawValue === "undefined") {
    return undefined
  }

  if (returnType === "number") {
    // Special case because Number("") === 0
    if (rawValue === "") {
      return undefined
    }
    return Number(rawValue)
  }

  if (returnType === "string") {
    if (typeof rawValue !== "string") {
      return ""
    }
    return rawValue
  }

  if (returnType === "array") {
    if (!Array.isArray(rawValue)) {
      return [rawValue]
    }
    return rawValue
  }

  return rawValue
}
