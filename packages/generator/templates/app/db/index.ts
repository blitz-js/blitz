import { PrismaClient } from "@prisma/client"
export * from "@prisma/client"

declare namespace globalThis {
  let prisma: PrismaClient
}

function getPersistentPrismaClient() {
  // Ensure the Prisma instance is re-used during hot-reloading
  // Otherwise, a new client would be created on every reload
  globalThis.prisma ||= new PrismaClient()
  return globalThis.prisma
}

export default process.env.NODE_ENV === "production"
  ? getPersistentPrismaClient()
  : new PrismaClient()
