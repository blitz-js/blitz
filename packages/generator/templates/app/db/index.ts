import { PrismaClient } from "@prisma/client"
export * from "@prisma/client"

let prisma = new PrismaClient()

export default prisma
