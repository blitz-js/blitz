import { makeServerOnlyPrisma } from "blitz"
import { PrismaClient } from "@prisma/client"

const ServerOnlyPrisma = makeServerOnlyPrisma(PrismaClient)

export * from "@prisma/client"
export default new ServerOnlyPrisma()
