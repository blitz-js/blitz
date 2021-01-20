import {exec} from "npm-run"

interface Constructor<T> {
  new (...args: any): T
}

interface Base {}

interface EnhancedPrismaClient {
  $reset: () => Promise<void>
}

export const enhancePrisma = <T extends Base>(
  PrismaClient: Constructor<T>,
): Constructor<EnhancedPrismaClient & T> => {
  return new Proxy(PrismaClient as any, {
    construct(target, args) {
      if (typeof window !== "undefined" && process.env.JEST_WORKER_ID === undefined) {
        // Return empty object if in the browser
        // Skip in Jest tests because window is defined in Jest tests
        return {}
      }

      if (!global._blitz_prismaClient) {
        const client = new target(...args) as EnhancedPrismaClient

        client.$reset = function reset() {
          if (process.env.NODE_ENV === "production") {
            throw new Error(
              "You are calling db.$reset() in a production environment. We think you probably didn't mean to do that, so we are throwing this error instead of destroying your life's work.",
            )
          }
          return new Promise<void>((res, rej) =>
            exec("prisma migrate reset --force --skip-generate --preview-feature", function (err) {
              if (err) {
                rej(err)
              } else {
                res()
              }
            }),
          )
        }

        global._blitz_prismaClient = client
      }

      return global._blitz_prismaClient
    },
  })
}
