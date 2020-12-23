function round(num: number, decimalPlaces: number) {
  const p = Math.pow(10, decimalPlaces)
  const m = num * p * (1 + Number.EPSILON)
  return Math.round(m) / p
}

/**
 * Formats milliseconds to a string
 * If more than 1s, it'll return seconds instead
 * @example
 * prettyMs(100) // -> `100ms`
 * prettyMs(1200) // -> `1.2s`
 * @param ms
 */
export function prettyMs(ms: number): string {
  if (ms >= 1000) {
    return `${round(ms / 1000, 1)}s`
  }
  return `${ms}ms`
}
