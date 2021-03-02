export const isServer = typeof window === "undefined"
export const isClient = typeof window !== "undefined"

export function clientDebug(...args: any) {
  if (typeof window !== "undefined" && (window as any)["DEBUG_BLITZ"]) {
    console.log("[BLITZ]", ...args)
  }
}
