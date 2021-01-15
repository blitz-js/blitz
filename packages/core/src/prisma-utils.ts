export const makeServerOnlyPrisma = <T>(PrismaClient: T): T => {
  return new Proxy(PrismaClient as any, {
    construct(target, args) {
      if (typeof window !== "undefined") return {}
      ;(globalThis as any)._blitz_prismaClient =
        (globalThis as any)._blitz_prismaClient || new target(...args)
      return (globalThis as any)._blitz_prismaClient
    },
  })
}
