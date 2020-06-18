import {useRouter} from "next/router"
import {useRouterQuery} from "./use-router-query"

type ParsedUrlQueryValue = string | string[] | undefined

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
  return Object.fromEntries(
    Object.entries(routerQuery).filter(
      ([key, value]) =>
        typeof query[key] === "undefined" || !areQueryValuesEqual(value, query[key]),
    ),
  )
}

export function useParams() {
  const router = useRouter()
  const query = useRouterQuery()

  return extractRouterParams(router.query, query)
}

export function useParam(key: string): undefined | string | string[]
export function useParam(key: string, returnType: "string"): string
export function useParam(key: string, returnType: "number"): number
export function useParam(key: string, returnType: "array"): string[]
export function useParam(
  key: string,
  returnType?: "string" | "number" | "array",
): undefined | number | string | string[] {
  const params = useParams()
  const rawValue = params[key]

  if (returnType === "number") {
    return Number(rawValue)
  }

  if (returnType === "string") {
    if (typeof rawValue === "undefined") {
      return ""
    }

    return rawValue
  }

  if (returnType === "array") {
    if (typeof rawValue === "undefined") {
      return []
    }

    if (typeof rawValue === "string") {
      return [rawValue]
    }

    return rawValue
  }

  return rawValue
}
