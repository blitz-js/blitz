export function getBlitzConfig() {
  if (typeof window !== "undefined") {
    return window.__BLITZ_DATA__?.config
  } else {
    return undefined
  }
}
