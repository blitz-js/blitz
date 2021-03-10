import { getRouteRegex } from './route-regex'

export function getRouteMatcher(routeRegex: ReturnType<typeof getRouteRegex>) {
  const { re, groups } = routeRegex
  return (pathname: string | null | undefined) => {
    const routeMatch = re.exec(pathname!)
    if (!routeMatch) {
      return false
    }

    const decode = (param: string) => {
      try {
        return decodeURIComponent(param)
      } catch (_) {
        const err: Error & { code?: string } = new Error(
          'failed to decode param'
        )
        err.code = 'DECODE_FAILED'
        throw err
      }
    }
    const params: { [paramName: string]: string | string[] } = {}

    Object.keys(groups).forEach((slugName: string) => {
      const g = groups[slugName]
      const m = routeMatch[g.pos]
      if (m !== undefined) {
        params[slugName] = ~m.indexOf('/')
          ? m.split('/').map((entry) => decode(entry))
          : g.repeat
          ? [decode(m)]
          : decode(m)
      }
    })
    return params
  }
}
