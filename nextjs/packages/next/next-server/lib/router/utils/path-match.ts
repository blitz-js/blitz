import * as pathToRegexp from 'next/dist/compiled/path-to-regexp'

export { pathToRegexp }

export const matcherOptions: pathToRegexp.TokensToRegexpOptions &
  pathToRegexp.ParseOptions = {
  sensitive: false,
  delimiter: '/',
}

export const customRouteMatcherOptions: pathToRegexp.TokensToRegexpOptions &
  pathToRegexp.ParseOptions = {
  ...matcherOptions,
  strict: true,
}

export default (customRoute = false) => {
  return (path: string) => {
    const keys: pathToRegexp.Key[] = []
    const matcherRegex = pathToRegexp.pathToRegexp(
      path,
      keys,
      customRoute ? customRouteMatcherOptions : matcherOptions
    )
    const matcher = pathToRegexp.regexpToFunction(matcherRegex, keys)

    return (pathname: string | null | undefined, params?: any) => {
      const res = pathname == null ? false : matcher(pathname)
      if (!res) {
        return false
      }

      if (customRoute) {
        for (const key of keys) {
          // unnamed params should be removed as they
          // are not allowed to be used in the destination
          if (typeof key.name === 'number') {
            delete (res.params as any)[key.name]
          }
        }
      }

      return { ...params, ...res.params }
    }
  }
}
