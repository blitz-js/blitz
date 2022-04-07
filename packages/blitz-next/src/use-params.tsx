import fromPairs from "lodash.frompairs"
import {NextRouter} from "next/router"
import {ParsedUrlQuery} from "querystring"
import React from "react"
import {RouterContext} from "./router-context"

type Dict<T> = Record<string, T | undefined>
type ReturnTypes = "string" | "number" | "array"

/**
 * `useRouter` is a React hook used to access `router` object within components
 *
 * @returns `router` object
 * @see Docs {@link https://blitzjs.com/docs/router#router-object | router}
 */
export function useRouter(): NextRouter {
  return React.useContext(RouterContext)
}

/*
 * Based on the code of https://github.com/lukeed/qss
 */
const decodeString = (str: string) => decodeURIComponent(str.replace(/\+/g, "%20"))

function decode(str: string) {
  if (!str) return {}

  let out: Record<string, string | string[]> = {}

  for (const current of str.split("&")) {
    let [key, value = ""] = current.split("=") as [string, string]
    key = decodeString(key)
    value = decodeString(value)

    if (key.length === 0) continue

    if (key in out) {
      out[key] = ([] as string[]).concat(out[key] as string, value)
    } else {
      out[key] = value
    }
  }

  return out
}

export function extractQueryFromAsPath(asPath: string) {
  return decode(asPath.split("?", 2)[1] as string)
}

export function useRouterQuery() {
  const router = useRouter()

  const query = React.useMemo(() => extractQueryFromAsPath(router.asPath), [router.asPath])

  return query
}

type ParsedUrlQueryValue = string | string[] | undefined
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

export function extractRouterParams(routerQuery: ParsedUrlQuery, asPathQuery: ParsedUrlQuery) {
  return fromPairs(
    Object.entries(routerQuery).filter(
      ([key, value]) =>
        typeof asPathQuery[key] === "undefined" || !areQueryValuesEqual(value, asPathQuery[key]),
    ),
  )
}

export function useParams(): Dict<string | string[]>
export function useParams(returnType?: ReturnTypes): Dict<string | string[]>
export function useParams(returnType: "string"): Dict<string>
export function useParams(returnType: "number"): Dict<number>
export function useParams(returnType: "array"): Dict<string[]>
export function useParams(returnType?: ReturnTypes | undefined) {
  const router = useRouter()
  const query = useRouterQuery()

  const params = React.useMemo(() => {
    const rawParams = extractRouterParams(router.query, query)

    if (returnType === "string") {
      const parsedParams: Dict<string> = {}
      for (const key in rawParams) {
        if (typeof rawParams[key] === "string") {
          parsedParams[key] = rawParams[key] as string
        }
      }
      return parsedParams
    }

    if (returnType === "number") {
      const parsedParams: Dict<number> = {}
      for (const key in rawParams) {
        if (rawParams[key]) {
          const num = Number(rawParams[key])
          parsedParams[key] = isNaN(num) ? undefined : num
        }
      }
      return parsedParams
    }

    if (returnType === "array") {
      const parsedParams: Dict<string[]> = {}
      for (const key in rawParams) {
        const rawValue = rawParams[key]
        if (Array.isArray(rawParams[key])) {
          parsedParams[key] = rawValue as string[]
        } else if (typeof rawValue === "string") {
          parsedParams[key] = [rawValue]
        }
      }
      return parsedParams
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
  const value = params[key]

  return value
}
