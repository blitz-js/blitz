import {exec} from "npm-run"

interface EnhancedPrisma {
  $reset: () => Promise<void>
}

export const enhancePrisma = <T>(PrismaClient: T): T & EnhancedPrisma => {
  return new Proxy(PrismaClient as any, {
    construct(target, args) {
      if (typeof window !== "undefined" && process.env.JEST_WORKER_ID === undefined) {
        // Return empty object if in the browser
        // Skip in Jest tests because window is defined in Jest tests
        return {}
      }
      if ((globalThis as any)._blitz_prismaClient) {
        return (globalThis as any)._blitz_prismaClient
      }

      const client = new target(...args)

      client.$reset = function reset() {
        return new Promise((res, rej) =>
          exec("prisma migrate reset --force --skip-generate --preview-feature", function (err) {
            if (err) {
              rej(err)
            } else {
              res()
            }
          }),
        )
      }
      ;(globalThis as any)._blitz_prismaClient = client
      return client
    },
  })
}
