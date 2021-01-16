export const makeServerOnlyPrisma = <T>(PrismaClient: T): T => {
  return new Proxy(PrismaClient as any, {
    construct(target, args) {
      if (typeof window !== "undefined" && process.env.JEST_WORKER_ID === undefined) {
        // Return empty object if in the browser
        // Skip in Jest tests because window is defined in Jest tests
        return {}
      }
      ;(globalThis as any)._blitz_prismaClient =
        (globalThis as any)._blitz_prismaClient || new target(...args)
      return (globalThis as any)._blitz_prismaClient
    },
  })
}
