import {spawn} from "cross-spawn"
import which from "npm-which"

interface Constructor<T = unknown> {
  new (...args: never[]): T
}

interface EnhancedPrismaClientAddedMethods {
  $reset: () => Promise<void>
}

interface EnhancedPrismaClientConstructor<TPrismaClientCtor extends Constructor> {
  new (...args: ConstructorParameters<TPrismaClientCtor>): InstanceType<TPrismaClientCtor> &
    EnhancedPrismaClientAddedMethods
}

export const enhancePrisma = <TPrismaClientCtor extends Constructor>(
  client: TPrismaClientCtor,
): EnhancedPrismaClientConstructor<TPrismaClientCtor> => {
  return new Proxy(client as EnhancedPrismaClientConstructor<TPrismaClientCtor>, {
    construct(target, args) {
      if (typeof window !== "undefined" && process.env.JEST_WORKER_ID === undefined) {
        // Return empty object if in the browser
        // Skip in Jest tests because window is defined in Jest tests
        return {}
      }

      if (!global._blitz_prismaClient) {
        const client = new target(...(args as any))

        client.$reset = async function reset() {
          if (process.env.NODE_ENV === "production") {
            throw new Error(
              "You are calling db.$reset() in a production environment. We think you probably didn't mean to do that, so we are throwing this error instead of destroying your life's work.",
            )
          }
          const prismaBin = which(process.cwd()).sync("prisma")
          await new Promise((res, rej) => {
            const process = spawn(prismaBin, ["migrate", "reset", "--force", "--skip-generate"], {
              stdio: "ignore",
            })
            process.on("exit", (code) => (code === 0 ? res(0) : rej(code)))
          })
          global._blitz_prismaClient.$disconnect()
        }

        global._blitz_prismaClient = client
      }

      return global._blitz_prismaClient
    },
  })
}
